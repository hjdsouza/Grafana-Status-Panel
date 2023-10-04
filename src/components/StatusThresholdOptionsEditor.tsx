import { FieldOverrideEditorProps, SelectableValue } from '@grafana/data';
import { Input, Label, Select } from '@grafana/ui';
import { AliasContext  } from 'lib/aliascontext';
import React from 'react';


//Describes the shape of the threshold 
export interface StatusThresholdOptions{
  valueHandler: 'Number Threshold' | 'String Threshold' | 'Date Threshold' | 'Disable Criteria' | 'Text Only';
  warn: string;
  crit: string;
  aliases: string[]
}



export interface StatusThresholdOptionsEditorProps extends FieldOverrideEditorProps<StatusThresholdOptions, any> {
  aliases: string[];
}


//Creates an array called valueHandlerOptions that stores threshold options

const valueHandlerOptions: Array<SelectableValue<StatusThresholdOptions['valueHandler']>> = [
  {
    label: 'Number Threshold',
    value: 'Number Threshold',
    description:
      'Change background color of the panel if got warning / error + show the alias of the problematic metrics.',
  },
  {
    label: 'String Threshold',
    value: 'String Threshold',
    description:
      'Change background color of the panel if got warning / error + show the alias of the problematic metrics.',
  },
  {
    label: 'Date Threshold',
    value: 'Date Threshold',
    description:
      'Change background color of the panel if got warning / error + show the alias of the problematic metrics.',
  },
  {
    label: 'Disable Criteria',
    value: 'Disable Criteria',
    description: 'Change background color of the panel to grey if disabled.',
  },
  {
    label: 'Text Only',
    value: 'Text Only',
    description: 'Show the alias + the value on the panel without any condition.',
  },


];






export const StatusThresholdOptionsEditor: React.FC<StatusThresholdOptionsEditorProps> = ({
  value,
  onChange,
  aliases,
}) => {
  const defaultValue = { valueHandler: 'Number Threshold', crit: '90', warn: '70' };

  let inputType: 'number' | 'text' | 'datetime-local' | undefined;
  if (value?.valueHandler === 'Number Threshold') {
    inputType = 'number';
  } else if (value?.valueHandler === 'String Threshold') {
    inputType = 'text';
  } else if (value?.valueHandler === 'Date Threshold') {
    inputType = 'datetime-local';
  }




  
  return (
    <>
      {aliases.map(alias => (
        <div key={alias}>
          <h3>{alias}</h3>
          <Select
            value={value?.valueHandler || defaultValue.valueHandler}
            options={valueHandlerOptions}
            onChange={({ value: valueHandler }) => valueHandler && onChange({ ...value, valueHandler })}
          />
          {inputType && (
            <>
              <Label>Critical Value</Label>
              <Input
                value={value?.crit || defaultValue.crit}
                type={inputType}
                onChange={({ currentTarget: { value: crit } }) => onChange({ ...value, crit })}
              />
              <Label>Warning Value</Label>
              <Input
                value={value?.warn || defaultValue.warn}
                type={inputType}
                onChange={({ currentTarget: { value: warn } }) => onChange({ ...value, warn })}
              />
            </>
          )}
        </div>
      ))}
    </>
  );
};
export const withAliases = (Component: React.ComponentType<StatusThresholdOptionsEditorProps>) => {
  return (props: FieldOverrideEditorProps<StatusThresholdOptions, any>) => {
    // For now, we'll use a dummy array for aliases, but you can replace this with the actual logic later.
    // const aliases = ["alias1", "alias2", "alias3"];
    const aliases = React.useContext(AliasContext);
    return <Component {...props} aliases={aliases} />;
  };
};

// Use the HOC to enhance the editor
export const EnhancedEditor = withAliases(StatusThresholdOptionsEditor)