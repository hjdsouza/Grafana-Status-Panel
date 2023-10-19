import { FieldOverrideEditorProps, SelectableValue } from '@grafana/data';
import { Button, Input, Label, Select } from '@grafana/ui';
import React from 'react';
import {useState} from 'react';




export interface StatusThresholdOptions {
  alias?: string;
  valueHandler: 'Number Threshold' | 'String Threshold' | 'Date Threshold' | 'Disable Criteria' | 'Text Only';
  warn: string;
  crit: string;
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
];

export const StatusThresholdOptionsEditor: React.FC<FieldOverrideEditorProps<AliasThresholds, any>> = ({
  value,
  onChange,
}) => {
  const [newAliasName, setNewAliasName] = useState('');
  const [editAlias, setEditAlias] = useState<string | null>(null);
  const [editedAliasName, setEditedAliasName] = useState('');

  const addAlias = () => {
    if (newAliasName) {
      onChange({ ...value, [newAliasName]: { valueHandler: 'Number Threshold', crit: '90', warn: '70' } });
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
        </div>
      ))}
      <div>
        <Input placeholder="Enter alias name" value={newAliasName} onChange={e => setNewAliasName(e.currentTarget.value)} />
        <Button onClick={addAlias}>Add Alias</Button>
      </div>
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