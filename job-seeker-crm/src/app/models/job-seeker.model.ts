import { CRM_STATUSES } from '../shared/constants';

type Status = (typeof CRM_STATUSES)[number];

export interface JobSeeker {
  id: number;
  name: string;
  email: string;
  status: Status;
  lastContacted: string;
  preference: string;
  campaigns?: number[];
}
