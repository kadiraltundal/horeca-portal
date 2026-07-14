import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async findAll(): Promise<Setting[]> {
    return this.settingsRepository.find({
      order: { key: 'ASC' },
    });
  }

  async findByKey(key: string): Promise<Setting | null> {
    return this.settingsRepository.findOne({ where: { key } });
  }

  async getValue(key: string): Promise<string | null> {
    const setting = await this.findByKey(key);
    return setting?.value || null;
  }

  async setValue(key: string, value: string, description?: string): Promise<Setting> {
    let setting = await this.findByKey(key);
    if (setting) {
      setting.value = value;
      if (description) {
        setting.description = description;
      }
    } else {
      setting = this.settingsRepository.create({
        key,
        value,
        description,
      });
    }
    return this.settingsRepository.save(setting);
  }

  async getMultiple(keys: string[]): Promise<Record<string, string | null>> {
    const settings = await this.settingsRepository
      .createQueryBuilder('setting')
      .where('setting.key IN (:...keys)', { keys })
      .getMany();

    const result: Record<string, string | null> = {};
    keys.forEach((key) => {
      const setting = settings.find((s) => s.key === key);
      result[key] = setting?.value || null;
    });

    return result;
  }
}