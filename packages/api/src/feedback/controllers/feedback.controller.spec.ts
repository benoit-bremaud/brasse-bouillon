import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { CreateFeedbackDto } from '../dtos/create-feedback.dto';
import { FeedbackResponseDto } from '../dtos/feedback-response.dto';
import { FeedbackService } from '../services/feedback.service';
import { FeedbackController } from './feedback.controller';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: FeedbackService;

  const mockService = {
    create: jest.fn(),
  };

  const dto: CreateFeedbackDto = {
    projectId: 'brasse-bouillon-website',
    category: 'suggestion',
    subCategory: 'improvement',
    message: 'It would help to show the file size before download.',
    url: 'https://brasse-bouillon.com/download',
    referrer: null,
    userAgent: 'Mozilla/5.0',
    viewport: { w: 390, h: 844 },
    locale: 'fr-FR',
    timestamp: '2026-05-21T10:15:00.000Z',
    widgetVersion: '0.2.0',
    scrollDepth: 1,
    sessionId: 'sess_abc',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [{ provide: FeedbackService, useValue: mockService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<FeedbackController>(FeedbackController);
    service = module.get<FeedbackService>(FeedbackService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Happy path — delegates to the service and returns its result
  it('delegates the submission to the service', async () => {
    const response: FeedbackResponseDto = {
      id: 'fb-1',
      category: 'suggestion',
      subCategory: 'improvement',
      createdAt: new Date('2026-05-21T10:15:01.000Z'),
    };
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue(response);

    const result = await controller.submit(dto);

    expect(createSpy).toHaveBeenCalledWith(dto);
    expect(result).toBe(response);
  });

  // Sad path — service errors bubble up to the global filter
  it('propagates a service error', async () => {
    jest.spyOn(service, 'create').mockRejectedValue(new Error('boom'));

    await expect(controller.submit(dto)).rejects.toThrow('boom');
  });
});
