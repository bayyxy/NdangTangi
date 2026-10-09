export type ChallengeType = 'tap' | 'swipe' | 'shake';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export type RepeatDay = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface AlarmChallenge {
  type: ChallengeType;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  repeatDays: RepeatDay[];
  challenge: AlarmChallenge;
  snoozeEnabled: boolean;
  snoozeCount: number;      // how many times already snoozed
  maxSnooze: number;        // max allowed snoozes (0 = disabled)
  createdAt: number;
}

export interface ActiveAlarm {
  alarmId: string;
  triggeredAt: number;
}
