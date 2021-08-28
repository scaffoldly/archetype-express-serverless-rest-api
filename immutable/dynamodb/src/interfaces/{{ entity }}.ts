import { {{ Entity }} } from '../models/interfaces';

export type {{ EntityRequest }} = {
  value?: string;
};

export type {{ EntityResponse }} = {{ Entity }};

export type {{ EntityListResponse }} = {
  results: {{ Entity }}[];
  count: number;
  total: number;
  next?: {
    pk: string;
    sk: string;
  };
};
