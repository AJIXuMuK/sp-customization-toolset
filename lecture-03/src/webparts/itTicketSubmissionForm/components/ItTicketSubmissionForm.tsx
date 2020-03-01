import * as React from 'react';
import styles from './ItTicketSubmissionForm.module.scss';
import { IItTicketSubmissionFormProps } from './IItTicketSubmissionFormProps';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/components/Dropdown';
import { PrimaryButton, Button, DefaultButton } from 'office-ui-fabric-react/lib/components/Button';
import * as strings from 'ItTicketSubmissionFormWebPartStrings';

export interface IItTicketSubmissionFormState {
  title?: string;
  details?: string;
  priority?: string;
}

export default class ItTicketSubmissionForm extends React.Component<IItTicketSubmissionFormProps, IItTicketSubmissionFormState> {
  constructor(props: IItTicketSubmissionFormProps) {
    super(props);

    this.state = {
      priority: 'low'
    };
  }

  public render(): React.ReactElement<IItTicketSubmissionFormProps> {
    const {
      title,
      details,
      priority
    } = this.state;
    return (
      <div className={styles.itTicketSubmissionForm}>
        <TextField label={strings.TitleLabel} value={title} onChange={(e, newValue) => { this._onTitleChange(newValue); }} />
        <TextField label={strings.DetailsLabel} multiline={true} value={details} onChange={(e, newValue) => { this._onDetailsChange(newValue); }} />
        <Dropdown
          label={strings.PriorityLabel}
          options={[{
            key: 'low',
            text: strings.PriorityLow
          }, {
            key: 'medium',
            text: strings.PriorityMedium
          }, {
            key: 'high',
            text: strings.PriorityHigh
          }]}
          onChange={(e, item) => { this._onPriorityChange(item); }}
          selectedKey={priority}
        />
        <div className={styles.buttons}>
          <PrimaryButton className={styles.button} text={strings.Submit} onClick={this._onSubmitClick} />
          <DefaultButton className={styles.button} text={strings.Clear} onClick={this._onClearClick} />
        </div>
      </div>
    );
  }

  private _onTitleChange = (title: string): void => {
    this.setState({
      title: title
    });
  }

  private _onDetailsChange = (details: string): void => {
    this.setState({
      details: details
    });
  }

  private _onPriorityChange = (priority: IDropdownOption): void => {
    this.setState({
      priority: priority.key.toString()
    });
  }

  private _onSubmitClick = (): void => {
    console.table(this.state);
  }

  private _onClearClick = (): void => {
    this.setState({
      title: '',
      details: '',
      priority: 'low'
    });
  }
}
