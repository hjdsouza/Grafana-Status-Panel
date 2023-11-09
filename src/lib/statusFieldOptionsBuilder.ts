import { FieldConfigEditorBuilder } from '@grafana/data';
import { StatusThresholdOptionsEditor, StatusThresholdOptions } from 'components/StatusThresholdOptionsEditor';


export interface AliasSpecificOptions {
  aggregation:
  | 'sum'
  | 'max'
  | 'min'
  | 'logmin'
  | 'mean'
  | 'last'
  | 'first'
  | 'lastNotNull'
  | 'firstNotNull'
  | 'count'
  | 'nonNullCount'
  | 'allIsNull'
  | 'allIsZero'
  | 'range'
  | 'diff'
  | 'delta'
  | 'step'
  | 'previousDeltaUp'
  | 'dataage';
  
valueDisplayRegex: string;
// thresholds: {
//   [alias: string]: StatusThresholdOptions | undefined;
// };
displayType: 'Regular' | 'Annotation';
fontFormat: 'Regular' | 'Bold' | 'Italic';
dateFormat: string;
displayAliasType: 'Warning / Critical' | 'Always';
displayValueWithAlias: 'Never' | 'When Alias Displayed' | 'Warning / Critical' | 'Critical Only';
disabledValue: string;

}
export interface StatusFieldOptions {
  // perAliasOptions: {
  //   [alias: string]: AliasSpecificOptions;
  // };
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
  