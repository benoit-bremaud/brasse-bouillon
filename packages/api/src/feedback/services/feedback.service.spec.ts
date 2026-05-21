import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateFeedbackDto } from '../dtos/create-feedback.dto';
import { Feedback } from '../entities/feedback.entity';
import { FeedbackService } from './feedback.service';

/**
 * Builds a valid feedback DTO; override any field per test.
 */
function buildDto(
  overrides: Partial<CreateFeedbackDto> = {},
): CreateFeedbackDto {
  return {
    projectId: 'brasse-bouillon-website',
    category: 'bug',
    subCategory: 'broken-feature',
    message: 'The download button does nothing on Android 13.',
    url: 'https://brasse-bouillon.com/download',
    referrer: 'https://brasse-bouillon.com/',
    userAgent: 'Mozilla/5.0',
    viewport: { w: 1280, h: 800 },
    locale: 'fr-FR',
    timestamp: '2026-05-21T10:15:00.000Z',
    widgetVersion: '0.2.0',
    scrollDepth: 0.42,
    sessionId: 'sess_8f3a1c',
    ...overrides,
  };
}

describe('FeedbackService', () => {
  let service: FeedbackService;
  let repository: Repository<Feedback>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: getRepositoryToken(Feedback), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    repository = module.get<Repository<Feedback>>(getRepositoryToken(Feedback));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    // Happy path
    it('persists the feedback and returns its acknowledgement', async () => {
      const dto = buildDto();
      const created = { ...dto } as unknown as Feedback;
      const saved: Feedback = {
        id: 'fb-1',
        project_id: dto.projectId,
        category: 'bug',
        sub_category: 'broken-feature',
        message: dto.message,
        url: dto.url,
        referrer: dto.referrer,
        user_agent: dto.userAgent,
        viewport_w: 1280,
        viewport_h: 800,
        locale: 'fr-FR',
        client_timestamp: new Date(dto.timestamp),
        widget_version: '0.2.0',
        scroll_depth: 0.42,
        session_id: 'sess_8f3a1c',
        created_at: new Date('2026-05-21T10:15:01.000Z'),
      };
      const createSpy = jest
        .spyOn(repository, 'create')
        .mockReturnValue(created);
      const saveSpy = jest.spyOn(repository, 'save').mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: 'brasse-bouillon-website',
          category: 'bug',
          sub_category: 'broken-feature',
          viewport_w: 1280,
          viewport_h: 800,
          scroll_depth: 0.42,
        }),
      );
      expect(saveSpy).toHaveBeenCalledWith(created);
      expect(result).toEqual({
        id: 'fb-1',
        category: 'bug',
        subCategory: 'broken-feature',
        createdAt: saved.created_at,
      });
    });

    // Edge case — 'other' carries a null sub-category and null referrer
    it('maps null sub-category and null referrer for the "other" category', async () => {
      const dto = buildDto({
        category: 'other',
        subCategory: null,
        referrer: null,
        scrollDepth: 0,
      });
      const created = {} as Feedback;
      const createSpy = jest
        .spyOn(repository, 'create')
        .mockReturnValue(created);
      jest.spyOn(repository, 'save').mockResolvedValue({
        id: 'fb-2',
        category: 'other',
        sub_category: null,
        created_at: new Date('2026-05-21T11:00:00.000Z'),
      } as Feedback);

      const result = await service.create(dto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'other',
          sub_category: null,
          referrer: null,
          scroll_depth: 0,
        }),
      );
      expect(result.subCategory).toBeNull();
    });

    // Sad path — repository failure propagates
    it('propagates a repository error', async () => {
      const dto = buildDto();
      jest.spyOn(repository, 'create').mockReturnValue({} as Feedback);
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new Error('DB write failed'));

      await expect(service.create(dto)).rejects.toThrow('DB write failed');
    });
  });
});
