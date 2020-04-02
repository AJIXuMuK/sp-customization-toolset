import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ItTicketSubmissionFormWebPartStrings';
import ItTicketSubmissionForm from './components/ItTicketSubmissionForm';
import { IItTicketSubmissionFormProps } from './components/IItTicketSubmissionFormProps';

import { SPHttpClient } from '@microsoft/sp-http';

import { sp } from '@pnp/sp'; // sp package entry point
import '@pnp/sp/webs'; // this import allows to work with webs like sp.web
import '@pnp/sp/lists'; // this import allows to work with lists like sp.web.lists
import '@pnp/sp/fields'; // this import allows to work with fields like sp.web.fields or sp.web.lists.getById().fields
import { IFieldInfo } from '@pnp/sp/fields'; // field information interface

/**
 * Choice Field interface.
 * Basic IFieldInfo provides properties that are common for all fields' types.
 * We need extend it with Choices field to work with Choice field
 */
interface IChoiceFieldInfo extends IFieldInfo {
  Choices: string[];
}

export interface IItTicketSubmissionFormWebPartProps {
  description: string;
  title: string;
}

export default class ItTicketSubmissionFormWebPart extends BaseClientSideWebPart<IItTicketSubmissionFormWebPartProps> {

  private _choices: string[];
  private readonly _siteId: string = 'aterentiev.sharepoint.com,161efb3b-33e1-4649-8f27-d9dc94478d4f,2da54180-4907-42c6-be2c-9820e5f1ffd3';
  private readonly _listId: string = '03afa985-19f6-4556-9684-00844c514b51';

  protected async onInit(): Promise<void> {
    // setting up PnPJS
    sp.setup({
      spfxContext: this.context
    });

    // getting "invokable" field object
    const field = sp.web.lists.getByTitle('IT Requests').fields.getByInternalNameOrTitle('Priority');
    // "invoking" field to select Choices property
    const choicesResult = await field.select('Choices')() as IChoiceFieldInfo;
    this._choices = choicesResult.Choices;
  }

  public render(): void {
    const element: React.ReactElement<IItTicketSubmissionFormProps> = React.createElement(
      ItTicketSubmissionForm,
      {
        description: this.properties.description,
        choices: this._choices,
        saveTicket: this.saveTicket,
        title: this.properties.title,
        displayMode: this.displayMode,
        titleUpdated: (newTitle: string) => {
          this.properties.title = newTitle;
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private saveTicket = async (title: string, details: string, priority: string): Promise<void> => {
    const client = await this.context.msGraphClientFactory.getClient();
    await client.api(`sites/${this._siteId}/lists/${this._listId}/items`)
      .version('v1.0').post({
        fields: {
          Title: title,
          Details: details,
          Priority: priority
        }
      });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
