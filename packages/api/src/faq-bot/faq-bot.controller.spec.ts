import { AskQuestionDto } from './dto/ask-question.dto';
import { FaqBotController } from './faq-bot.controller';
import { FaqBotService } from './faq-bot.service';
import { BotChallenge } from './ports/bot-check.port';

describe('FaqBotController', () => {
  let service: { ask: jest.Mock; issueChallenge: jest.Mock };
  let controller: FaqBotController;

  beforeEach(() => {
    service = { ask: jest.fn(), issueChallenge: jest.fn() };
    controller = new FaqBotController(service as unknown as FaqBotService);
  });

  it('ask() delegates the validated question to the service (happy)', async () => {
    service.ask.mockResolvedValue({ answer: 'Coucou !' });
    const dto: AskQuestionDto = { question: 'salut' };

    await expect(controller.ask(dto)).resolves.toEqual({ answer: 'Coucou !' });
    expect(service.ask).toHaveBeenCalledWith('salut');
  });

  it('challenge() delegates to the service (happy)', async () => {
    const challenge: BotChallenge = {
      algorithm: 'SHA-256',
      challenge: 'c',
      maxnumber: 1,
      salt: 's',
      signature: 'sig',
    };
    service.issueChallenge.mockResolvedValue(challenge);

    await expect(controller.challenge()).resolves.toEqual(challenge);
  });
});
