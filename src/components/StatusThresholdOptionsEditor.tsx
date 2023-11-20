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
  javascriptCode?: string;
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

  //Code for expanding and collapsing alias
  const [expandedAliases, setExpandedAliases] = useState<{ [key: string]: boolean }>({});

  const toggleAlias = (alias: string) => {
    setExpandedAliases(prevExpandedAliases => ({
      ...prevExpandedAliases,
      [alias]: !prevExpandedAliases[alias] // Toggle the current state
    }));
  };


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



  return (
    <>
      {Object.entries(value || {}).map(([alias, threshold]) => (
        <div key={alias}>
          <h4 onClick={() => toggleAlias(alias)} style={{             cursor: 'pointer', 
            userSelect: 'none',
            fontSize: '15px',
            fontWeight: 500,
            lineHeight: '1.25',
            color: 'rgb(204, 204, 220)',
            fontFamily: 'Inter, Helvetica, Arial, sans-serif'}}>
            {alias} {expandedAliases[alias] ? '▲' : '▼'}
          </h4>
  
          {expandedAliases[alias] && (
            <>
              {editAlias === alias ? (
                <>
                  <Input value={editedAliasName} onChange={e => setEditedAliasName(e.currentTarget.value)} />
                  <Button onClick={saveEditedAlias}>Save</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => startEditAlias(alias)}>Edit</Button>
                  <Button variant="destructive" onClick={() => deleteAlias(alias)}>Delete</Button>
                </>
              )}
              <SingleAliasThresholdEditor
                value={threshold}
                onChange={(newThreshold) => setThresholdForAlias(alias, newThreshold)}
              />
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
              }

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
      />

      {/* Render the following components only when valueHandler is not 'Javascript' */}
      {value.valueHandler !== 'Javascript' && (
        <>
          {/* Components for Critical Value, Warning Value, Font Format, etc. */}
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
          <>
            <Label title="What to do if the query returns multiple data points">
              <Label>Aggregation Method</Label>
            </Label>
            <Select
              value={value.aggregation}
              options={aggregationOptions}
              onChange={({ value: newAggregation }) => onChange({ ...value, aggregation: newAggregation })}
            />
          </>
          <>
            <Label title="When to display the alias: 
  Warning / Critical - The alias will be displayed in warning or critical state. 
  Always - The alias will always be displayed, regardless of the critical and warning state.">
              Display Alias Type
            </Label>
            <Select
              value={value.displayAliasType}
              options={displayAliasType}
              onChange={({ value: newDisplayAliasType }) => onChange({ ...value, displayAliasType: newDisplayAliasType })}
            />
          </>

          <>
            <Label title="When to display the value along with the alias: 
  Never - The value will never be displayed. 
  When Alias Displayed - The value will be displayed always when the alias is displayed. 
  Warning / Critical - The value will be displayed in warning or critical state. 
  Critical Only - The value will be displayed in critical state only.">
              Display Value with Alias
            </Label>
            <Select
              value={value.displayValueWithAlias}
              options={displayValueWithAlias}
              onChange={({ value: newDisplayValueWithAlias }) => onChange({ ...value, displayValueWithAlias: newDisplayValueWithAlias })}
            />
          </>
          <>
            <Label title="The location the value will be displayed: 
  Regular - The alias + the value will be displayed in the center, under the panel title. 
  Annotation - The alias + the value will be displayed on the top left. If the value meets a threshold condition, it will be displayed as in the regular state.">
              Display Position
            </Label>
            <Select
              value={value.displayType}
              options={displayType}
              onChange={({ value: newDisplayType }) => onChange({ ...value, displayType: newDisplayType })}
            />
          </>
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
      )}
      {/* JavaScript Code Editor - Only show when 'Javascript' is the selected valueHandler */}
      {value.valueHandler === 'Javascript' && (
        <>
          {/* Aggregation select component */}
          <Label>Aggregation Method</Label>
          <Select
            value={value.aggregation}
            options={aggregationOptions}
            onChange={({ value: newAggregation }) => onChange({ ...value, aggregation: newAggregation })}
          />
          <Label>Display Position</Label>
          <Select
            value={value.displayType}
            options={displayType}
            onChange={({ value: newDisplayType }) => onChange({ ...value, displayType: newDisplayType })}
          />
          <Label>JavaScript Code</Label>
          <AceEditor
            mode="javascript"
            theme="monokai"
            name="javascript_code_editor"
            value={value.javascriptCode || ''}
            onChange={(newCode) => onChange({ ...value, javascriptCode: newCode })}
            height="200px"
            width="100%"
          />
        </>
      )}
    </>
  );
};

