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

export interface IItTicketSubmissionFormWebPartProps {
  description: string;
}

export default class ItTicketSubmissionFormWebPart extends BaseClientSideWebPart<IItTicketSubmissionFormWebPartProps> {

  private _choices: string[];
  private readonly _siteId: string = 'aterentiev.sharepoint.com,161efb3b-33e1-4649-8f27-d9dc94478d4f,2da54180-4907-42c6-be2c-9820e5f1ffd3';
  private readonly _listId: string = '03afa985-19f6-4556-9684-00844c514b51';

  protected async onInit(): Promise<void> {
    // getting field from a list by internal name
    const fieldResponse = await this.context.spHttpClient
      .get(`https://aterentiev.sharepoint.com/sites/SPCustomizationToolset/_api/web/lists/getByTitle('IT%20Requests')/Fields?$filter=InternalName%20eq%20%27Priority%27`,
        SPHttpClient.configurations.v1);
    // converting response to JSON
    const fieldJson = await fieldResponse.json();

    // choices are located in Choices property of the field
    this._choices = fieldJson.value[0].Choices;
  }

  public render(): void {
    const element: React.ReactElement<IItTicketSubmissionFormProps> = React.createElement(
      ItTicketSubmissionForm,
      {
        description: this.properties.description,
        choices: this._choices,
        saveTicket: this.saveTicket
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private saveTicket = async(title: string, details: string, priority: string): Promise<void> => {
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
