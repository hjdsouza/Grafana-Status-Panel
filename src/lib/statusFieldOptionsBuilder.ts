import { FieldConfigEditorBuilder } from '@grafana/data';
import { StatusThresholdOptionsEditor, StatusThresholdOptions } from 'components/StatusThresholdOptionsEditor';


export interface StatusFieldOptions {
  thresholds: {
    [alias: string]: StatusThresholdOptions | undefined;
  };

}

export const statusFieldOptionsBuilder = (builder: FieldConfigEditorBuilder<StatusFieldOptions>) =>
  builder
    .addCustomEditor({
      path: 'thresholds',
      id: 'thresholds',
      name: 'Threshold Type',
      // defaultValue: { valueHandler: 'Number Threshold', warn: 70, crit: 90 },
      description: 'The type of data to show to the panel.',
      editor: StatusThresholdOptionsEditor,
      override: StatusThresholdOptionsEditor,
      category: ['Threshold Options'],
      process: x => x,
      shouldApply: () => true,
      
    })
  