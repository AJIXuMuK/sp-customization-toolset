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
        choices: this._choices
      }
    );

    ReactDom.render(element, this.domElement);
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
