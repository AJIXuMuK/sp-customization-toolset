import * as React from 'react';
import styles from './ItTicketSubmissionForm.module.scss';
import { IItTicketSubmissionFormProps } from './IItTicketSubmissionFormProps';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/components/Dropdown';
import { PrimaryButton, Button, DefaultButton } from 'office-ui-fabric-react/lib/components/Button';
import * as strings from 'ItTicketSubmissionFormWebPartStrings';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';

export interface IItTicketSubmissionFormState {
  title?: string;
  details?: string;
  priority?: string;
  isSubmitted?: boolean;
}

export default class ItTicketSubmissionForm extends React.Component<IItTicketSubmissionFormProps, IItTicketSubmissionFormState> {
  constructor(props: IItTicketSubmissionFormProps) {
    super(props);

    this.state = {
      priority: props.choices[0]
    };
  }

  public render(): React.ReactElement<IItTicketSubmissionFormProps> {
    const {
      title,
      details,
      priority,
      isSubmitted
    } = this.state;

    const {
      choices,
      title: webPartTitle, // here we provide alias for title as we already have title variable from state object
      displayMode,
      titleUpdated
    } = this.props;

    return (
      <div className={styles.itTicketSubmissionForm}>
        <WebPartTitle
          displayMode={displayMode}
          title={webPartTitle}
          updateProperty={titleUpdated} />
        {isSubmitted &&
          <span>{strings.Submitted}</span>}
        {!isSubmitted &&
          <>
            <TextField label={strings.TitleLabel} value={title} onChange={(e, newValue) => { this._onTitleChange(newValue); }} />
            <TextField label={strings.DetailsLabel} multiline={true} value={details} onChange={(e, newValue) => { this._onDetailsChange(newValue); }} />
            <Dropdown
              label={strings.PriorityLabel}
              options={choices.map(c => {
                return {
                  key: c,
                  text: c
                };
              })}
              onChange={(e, item) => { this._onPriorityChange(item); }}
              selectedKey={priority}
            />
            <div className={styles.buttons}>
              <PrimaryButton className={styles.button} text={strings.Submit} onClick={this._onSubmitClick} />
              <DefaultButton className={styles.button} text={strings.Clear} onClick={this._onClearClick} />
            </div>
          </>}
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

  private _onSubmitClick = async (): Promise<void> => {
    const {
      title,
      details,
      priority
    } = this.state;
    await this.props.saveTicket(title, details, priority);
    this.setState({
      isSubmitted: true
    });
  }

  private _onClearClick = (): void => {
    this.setState({
      title: '',
      details: '',
      priority: 'low'
    });
  }
}
