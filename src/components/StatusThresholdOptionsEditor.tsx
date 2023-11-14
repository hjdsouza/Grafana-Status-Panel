import { FieldOverrideEditorProps, SelectableValue } from '@grafana/data';
import { Button, Input, Label, Select } from '@grafana/ui';
import React from 'react';
import { useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';



const aggregationOptions: Array<SelectableValue<string>> = [
  { label: 'Last', value: 'last' },
  { label: 'First', value: 'first' },
  { label: 'Max', value: 'max' },
  { label: 'Min', value: 'min' },
  { label: 'Sum', value: 'sum' },
  { label: 'Avg', value: 'mean' },
  { label: 'Delta', value: 'delta' },
  { label: 'Data Age', value: 'dataage' },
];

const fontFormatOptions: Array<SelectableValue<string>> = [
  { label: 'Regular', value: 'Regular' },
  { label: 'Bold', value: 'Bold' },
  { label: 'Italic', value: 'Italic' },
];

const displayAliasType: Array<SelectableValue<string>> = [
  { label: 'Warning / Critical', value: 'Warning / Critical' },
  { label: 'Always', value: 'Always' },
];

const displayValueWithAlias: Array<SelectableValue<string>> = [
  { label: 'Never', value: 'Never' },
  { label: 'When Alias Displayed', value: 'When Alias Displayed' },
  { label: 'Warning / Critical', value: 'Warning / Critical' },
  { label: 'Critical Only', value: 'Critical Only' },
];

const displayType: Array<SelectableValue<string>> = [
  { label: 'Regular', value: 'Regular' },
  { label: 'Annotation', value: 'Annotation' },
];


export interface StatusThresholdOptions {
  alias?: string;
  valueHandler: 'Number Threshold' | 'String Threshold' | 'Date Threshold' | 'Disable Criteria' | 'Text Only' | 'Javascript';
  warn: string;
  crit: string;
  aggregation?: string; // New property for aggregation method
  fontFormat?: string;
  displayAliasType?: string;
  displayValueWithAlias?: string;
  valueDisplayRegex?: string;
  displayType?: string;
  dateFormat?: string;
  disabledValue?: string;

}

export interface AliasThresholds {
  [alias: string]: StatusThresholdOptions;
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
  {
    label: 'Javascript',
    value: 'Javascript',
    description: ''
  }
];

export const StatusThresholdOptionsEditor: React.FC<FieldOverrideEditorProps<AliasThresholds, any>> = ({
  value,
  onChange,
}) => {
  const [newAliasName, setNewAliasName] = useState('');
  const [editAlias, setEditAlias] = useState<string | null>(null);
  const [editedAliasName, setEditedAliasName] = useState('');
  const [javascriptCode, setJavascriptCode] = useState<{[key: string]: string}>({}); // State variable to manage the javascript code


  const addAlias = () => {
    if (newAliasName) {
      onChange({ ...value, [newAliasName]: { valueHandler: 'Number Threshold', crit: '90', warn: '70', aggregation: 'dataage', } });
      setNewAliasName('');  // Reset the input after adding
    }
  };

  const startEditAlias = (alias: string) => {
    setEditAlias(alias);
    setEditedAliasName(alias);
  };

  const saveEditedAlias = () => {
    if (editAlias && editedAliasName) {
      const updatedValue = { ...value };
      updatedValue[editedAliasName] = updatedValue[editAlias];
      delete updatedValue[editAlias];
      onChange(updatedValue);
      setEditAlias(null);
      setEditedAliasName('');
    }
  };

  const deleteAlias = (aliasToDelete: string) => {
    const updatedValue = { ...value };
    delete updatedValue[aliasToDelete];
    onChange(updatedValue);
  };

  const setThresholdForAlias = (alias: string, threshold: StatusThresholdOptions) => {
    onChange({ ...value, [alias]: threshold });
  };

  // Event handlers
  const handleRunClick = (alias:string) => {
    const codeToRun = javascriptCode[alias];
    // Logic to handle JavaScript code execution for the specific alias
  };

  const handleClearClick = (alias:string) => {
    setJavascriptCode(prevCodes => ({ ...prevCodes, [alias]: '' }));
  };

  return (
    <>
      {Object.entries(value || {}).map(([alias, threshold]) => (
        <div key={alias}>
          {editAlias === alias ? (
            <>
              <Input value={editedAliasName} onChange={e => setEditedAliasName(e.currentTarget.value)} />
              <Button onClick={saveEditedAlias}>Save</Button>
            </>
          ) : (
            <>
              <h4>{alias}</h4>
              <Button onClick={() => startEditAlias(alias)}>Edit</Button>
            </>
          )}
          <Button variant="destructive" onClick={() => deleteAlias(alias)}>Delete</Button>
          <SingleAliasThresholdEditor
            value={threshold}
            onChange={(newThreshold) => setThresholdForAlias(alias, newThreshold)}
          />
          <SingleAliasThresholdEditor
            value={threshold}
            onChange={(newThreshold) => setThresholdForAlias(alias, newThreshold)}
          />
          {/* JavaScript Editor and Buttons for each Alias */}
          {threshold.valueHandler === 'Javascript' && (
            <>
              <AceEditor
                height="200px"
                mode="javascript"
                value={javascriptCode[alias] || ''}
                onChange={(newCode:string) => setJavascriptCode(prevCodes => ({ ...prevCodes, [alias]: newCode }))}
              />
              <button onClick={() => handleRunClick(alias)}>Run</button>
              <button onClick={() => handleClearClick(alias)}>Clear</button>
            </>
          )}
        </div>
      ))}
      <div>
        <Input placeholder="Enter alias name" value={newAliasName} onChange={e => setNewAliasName(e.currentTarget.value)} />
        <Button onClick={addAlias}>Add Alias</Button>


      </div>

    </>
  );
};


// Update SingleAliasThresholdEditor to include the aggregation select component
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
  console.log('Rendering with value:', value);

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
      <Label>Font Format</Label>
      <Select
        value={value.fontFormat}
        options={fontFormatOptions}
        onChange={({ value: newFontFormat }) => onChange({ ...value, fontFormat: newFontFormat })}
      />
      {/* Aggregation select component */}
      <Label>Aggregation Method</Label>
      <Select
        value={value.aggregation}
        options={aggregationOptions}
        onChange={({ value: newAggregation }) => onChange({ ...value, aggregation: newAggregation })}
      />
      <Label>Display Alias Type</Label>
      <Select
        value={value.displayAliasType}
        options={displayAliasType}
        onChange={({ value: newDisplayAliasType }) => onChange({ ...value, displayAliasType: newDisplayAliasType })}
      />
      <Label>Display Value with Alias</Label>
      <Select
        value={value.displayValueWithAlias}
        options={displayValueWithAlias}
        onChange={({ value: newDisplayValueWithAlias }) => onChange({ ...value, displayValueWithAlias: newDisplayValueWithAlias })}
      />
      <Label>Display Position</Label>
      <Select
        value={value.displayType}
        options={displayType}
        onChange={({ value: newDisplayType }) => onChange({ ...value, displayType: newDisplayType })}
      />
      {/* Date Format Input */}
      <Label>Date Format</Label>
      <Input
        type="text"
        value={value.dateFormat || ''} // Use an empty string if dateFormat is undefined
        onChange={(e) => onChange({ ...value, dateFormat: e.currentTarget.value })}
        placeholder="Enter date format"
      />
      {/* Disabled Value Input */}
      <Label>Disabled Value</Label>
      <Input
        type="text"
        value={value.disabledValue || ''} // Use an empty string if disabledValue is undefined
        onChange={(e) => onChange({ ...value, disabledValue: e.currentTarget.value })}
        placeholder="Enter disabled value"
      />
    </>
  );
};

