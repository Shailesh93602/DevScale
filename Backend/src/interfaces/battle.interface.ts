export interface IBattle {
  id: string;
  title: string;
  description: string;
  user_id: string;
  topic_id: string;
  difficulty: string;
  length: string;
  date: string;
  time: string;
}

export interface ICreateBattleDTO {
  title: string;
  description: string;
  topic_id: string;
  difficulty: string;
  length: string;
  date: string;
  time: string;
  user_id: string;
}
