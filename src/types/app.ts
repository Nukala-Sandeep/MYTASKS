export type QuestType = 'Main Story'|'Daily Habit'|'Urgent Raid'|'Side Quest';
export type Rank = 'E'|'D'|'C'|'B'|'A'|'S';
export type Mood = 'Soft'|'Playful'|'Goblin';

export interface Quest {
  id:string; title:string; type:QuestType; rank:Rank; due:string;
  xp:number; gold:number; completed:boolean; createdAt:number;
}
export interface Profile {
  name:string; epithet:string; dob:string; zodiac:string;
  awakened:boolean; vaultEnabled:boolean; notificationsEnabled:boolean;
}
export interface AppData {
  profile:Profile;
  quests:Quest[];
  level:number; xp:number; gold:number; streak:number; lastCompletedDate:string;
}
