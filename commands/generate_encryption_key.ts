import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { randomBytes } from 'crypto'

export default class GenerateEncryptionKey extends BaseCommand {
  static commandName = 'generate:encryption-key';
  static description = 'Generates TOKEN_ENCRYPTION_KEY for admin authentication';

  static options: CommandOptions = {};

  @flags.number({ description: 'Force recreate collections without prompting', default: 32 })
  declare length: number;

  async run() {
    this.logger.info('Generating encryption key')
    const key = randomBytes(this.length).toString('hex')
    this.logger.success('Generated encryption key (add to .env):')
    this.logger.info(`TOKEN_ENCRYPTION_KEY=${key}`);
  }
}