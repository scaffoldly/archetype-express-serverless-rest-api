import { {{ entity | pascal_case }} } from '../models/interfaces';

export type {{ entity | pascal_case }}Request = {
  value?: string;
};

export type {{ entity | pascal_case }}Response = {{ entity | pascal_case }};

export type {{ entity | pascal_case }}ListResponse = {
  results: {{ entity | pascal_case }}[];
  count: number;
  total: number;
  next?: {
    pk: string;
    sk: string;
  };
};
