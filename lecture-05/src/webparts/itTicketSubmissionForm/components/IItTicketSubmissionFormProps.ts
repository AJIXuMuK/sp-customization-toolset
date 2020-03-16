export interface IItTicketSubmissionFormProps {
  description: string;
  choices: string[];
  saveTicket: (title: string, details: string, priority: string) => Promise<void>;
}
