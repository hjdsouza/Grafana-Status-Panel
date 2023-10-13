import { FieldOverrideEditorProps, SelectableValue } from '@grafana/data';
import { Input, Label, Select } from '@grafana/ui';
import React from 'react';




export interface StatusThresholdOptions {
  alias?: string;
  valueHandler: 'Number Threshold' | 'String Threshold' | 'Date Threshold' | 'Disable Criteria' | 'Text Only';
  warn: string;
  crit: string;
}

export interface AliasThresholds {
  [alias: string]: StatusThresholdOptions;
}

export interface StatusThresholdOptionsEditorProps extends FieldOverrideEditorProps<AliasThresholds, any> {
  aliases?: string[];
}

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
  const addAlias = (selectedAlias: string) => {
    if (selectedAlias) {
      onChange({ ...value, [selectedAlias]: { valueHandler: 'Number Threshold', crit: '90', warn: '70' } });
    }
  };
  // const setThresholdForAlias = (alias: string, threshold: StatusThresholdOptions) => {
  //   onChange({ ...value, [alias]: threshold });
  // };

  return (
    <>
      {(aliases || []).map(alias => (
        <div key={alias}>
          <h4>{alias}</h4>
          <SingleAliasThresholdEditor
            value={value[alias] || { valueHandler: 'Number Threshold', crit: '90', warn: '70' }}
            onChange={(newThreshold) => {
              onChange({ ...value, [alias]: newThreshold });
            }}
          />
        </div>
      ))}
      <Select
        options={aliases ? aliases.map(alias => ({ label: alias, value: alias })) : []}
        onChange={selected => {
          if (selected.value) {
              addAlias(selected.value);
          }
      }}
      />
    </>
  );
};

const SingleAliasThresholdEditor: React.FC<{
  value: StatusThresholdOptions;
  onChange: (value: StatusThresholdOptions) => void;
}> = ({ value, onChange }) => {
  let inputType;
  if (value.valueHandler === 'Number Threshold') {
    inputType = 'number';
  } else if (value.valueHandler === 'String Threshold') {
    inputType = 'text';
  } else if (value.valueHandler === 'Date Threshold') {
    inputType = 'datetime-local';
  }

  return (
    <>
      <Select
        value={value.valueHandler}
        options={valueHandlerOptions}
        onChange={({ value: valueHandler }) => valueHandler && onChange({ ...value, valueHandler })}
      ></Select>
      {inputType && (
        <>
          <Label>Critical Value</Label>
          <Input
            value={value.crit}
            type={inputType}
            onChange={({ currentTarget: { value: crit } }) => onChange({ ...value, crit })}
          ></Input>
          <Label>Warning Value</Label>
          <Input
            value={value.warn}
            type={inputType}
            onChange={({ currentTarget: { value: warn } }) => onChange({ ...value, warn })}
          ></Input>
        </>
      )}
    </>
  );
};