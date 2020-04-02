import { DisplayMode } from "@microsoft/sp-core-library";

export interface IItTicketSubmissionFormProps {
  description: string;
  /**
   * Priority choices
   */
  choices: string[];
  /**
   * Save ticket handler
   */
  saveTicket: (title: string, details: string, priority: string) => Promise<void>;
  /**
   * Current display mode of the web part (Page)
   */
  displayMode: DisplayMode;
  /**
   * Web part's title
   */
  title: string;
  /**
   * Web part's title update handler
   */
  titleUpdated: (newTitle: string) => void;
}
