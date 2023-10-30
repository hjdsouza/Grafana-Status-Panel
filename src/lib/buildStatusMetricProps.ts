import {
  PanelData,
  FieldConfigSource,
  FieldConfig,
  formattedValueToString,
  toFixedUnit,
  toFixed,
  dateTimeAsMoment,
  InterpolateFunction,
  LinkModel,
} from '@grafana/data';
import { css, cx } from 'emotion';
import _ from 'lodash';

import { StatusFieldOptions } from 'lib/statusFieldOptionsBuilder';
import { StatusPanelOptions } from 'lib/statusPanelOptionsBuilder';

//export the aliases variable
export let aliases: string[] = [];

type StatusType = 'ok' | 'hide' | 'warn' | 'crit' | 'disable' | 'noData';
interface StatusMetricProp extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  alias: string;
  displayValue?: string | number;
  link?: LinkModel;
}
let aliasStatuses: Record<string, StatusType> = {};

export function buildStatusMetricProps(
  data: PanelData,
  fieldConfig: FieldConfigSource,
  options: StatusPanelOptions,
  colorClasses: { ok: string; warn: string; crit: string; disable: string; noData: string; hide: string },
  replaceVariables: InterpolateFunction,
  timeZone: string
) {
  let annotations: StatusMetricProp[] = [];
  let displays: StatusMetricProp[] = [];
  let crits: StatusMetricProp[] = [];
  let warns: StatusMetricProp[] = [];
  let disables: StatusMetricProp[] = [];

  function extractLastValueAndAlias(frame: any, field: any): [any, string] {
    const aliasName = frame.name || field.config.custom?.aliasName || field.name;
    const nonNullValue = field.values.toArray().find((v: any) => v !== null && v !== undefined);
    if (nonNullValue === undefined) {
      console.log(`No non-null data for alias: ${aliasName}`);
      return [null, aliasName];
    }
    return [nonNullValue, aliasName];
  }

  const processedAlias = new Set(); //to keep track of processed alias names
  
  //Create a set of expected aliases
const expectedAliases = new Set();
data.series.forEach(df => {
  df.fields.forEach(field => {
    const config: FieldConfig<StatusFieldOptions> = _.defaultsDeep({ ...field.config }, fieldConfig.defaults);
    if (config.custom && config.custom.thresholds) {
      Object.keys(config.custom.thresholds).forEach(alias => {
        expectedAliases.add(alias);
      });
    }
  });
});

  data.series.forEach(df => {
    df.fields.forEach(field => {
      if (field.name === 'Time') {
        return; // Skip time fields
      }
  
      if (!field.state) {
        console.warn("Unexpected data structure: field.state is not defined.");
        return;
      }
  
      const config: FieldConfig<StatusFieldOptions> = _.defaultsDeep({ ...field.config }, fieldConfig.defaults);
      if (!config.custom) {
        return;
      }  

      // Extract the first non-null value and the alias
      const [value, aliasName] = extractLastValueAndAlias(df, field);
    
      // If value is null, skip to the next field
      if (value === null || processedAlias.has(aliasName)) {
        return;
      }
      // Mark this alias as processed
      processedAlias.add(aliasName);
      expectedAliases.delete(aliasName);

      // determine field status & handle formatting based on value handler
      let fieldStatus: StatusType = config.custom.displayAliasType === 'Always' ? 'ok' : 'hide';
      let displayValue = '';

    // Hannah's code

    // const aliasName = config.displayName || df.name || df.refId || ''
    if (!aliases.includes(aliasName)) {
      aliases.push(aliasName);
    }
    const aliasThresholds = config.custom.thresholds[aliasName];

    if (!aliasThresholds) {
      console.warn(`No thresholds defined for alias: ${aliasName}`);
      return; // Skip to the next iteration of the loop
    }

    // console.log("Available calcs:", field.state.calcs);

    /*

    START OF DATA AGE

    */

    if (config.custom.aggregation === 'dataage') {
      // Extract the last timestamp from the time series data
      // console.log("Data Frame:",df);
      const lastTimestamp = df.fields.find(f => f.name === 'Time')?.values.get(0);
      // console.log("Last Timestamp:", lastTimestamp);
      if (lastTimestamp) {
        const now = Date.now();
        const dataAgeInSeconds = (now - lastTimestamp) / 1000;
        console.log("Data Age in Seconds:", dataAgeInSeconds);
        if (dataAgeInSeconds < 60) {
          displayValue = `${dataAgeInSeconds.toFixed(0)} seconds ago`;
        } else if (dataAgeInSeconds < 3600) {
          const minutes = dataAgeInSeconds / 60;
          displayValue = `${minutes.toFixed(0)} minutes ago`;
        } else if (dataAgeInSeconds < 86400) { // 3600 seconds * 24 hours
          const hours = dataAgeInSeconds / 3600;
          displayValue = `${hours.toFixed(0)} hours ago`;
        } else {
          const days = dataAgeInSeconds / 86400;
          displayValue = `${days.toFixed(0)} days ago`;


        }
      // Use the thresholds for "Data Age" to decide the field status
      const crit = +aliasThresholds.crit;
      const warn = +aliasThresholds.warn;
      console.log("Critical Threshold:", crit);
      console.log("Warning Threshold:", warn);
      console.log("This is the critical value", crit);
      if (dataAgeInSeconds / 60 > crit) {
        fieldStatus = 'crit';
        console.log(`Alias: ${aliasName}, Data Age: ${dataAgeInSeconds} seconds, Status: Critical`);
        } else if (dataAgeInSeconds / 60 > warn) {
          fieldStatus = 'warn';
          console.log(`Alias: ${aliasName}, Data Age: ${dataAgeInSeconds} seconds, Status: Warning`);
                  }
      } else {
        console.warn("Unable to compute data age. Time field missing or empty.");
      }

      
    }
    // End of Data Age implementation

    if (config.custom.aggregation !== 'dataage') {
      switch (aliasThresholds.valueHandler) {
        case 'Number Threshold':
          // let value: number = field.state.calcs![config.custom.aggregation];
          const crit = +aliasThresholds.crit; // Access from aliasThresholds
          const warn = +aliasThresholds.warn; // Access from aliasThresholds
          if ((warn <= crit && crit <= value) || (warn >= crit && crit >= value)) {
            fieldStatus = 'crit';
          } else if ((warn <= value && value <= crit) || (warn >= value && value >= crit)) {
            fieldStatus = 'warn';
          }


          if (!_.isFinite(value)) {
            displayValue = 'Invalid Number';
          } else if (config.unit) {
            displayValue = formattedValueToString(toFixedUnit(config.unit)(value, config.decimals));
          } else {
            displayValue = toFixed(value, config.decimals);
          }
          break;
        case 'String Threshold':
          // displayValue = field.state.calcs![config.custom.aggregation];
          displayValue = value.toString();
          if (displayValue === undefined || displayValue === null || displayValue !== displayValue) {
            displayValue = 'Invalid String';
          }

          if (displayValue === aliasThresholds.crit) {
            fieldStatus = 'crit';
          } else if (displayValue === aliasThresholds.warn) {
            fieldStatus = 'warn';
          }
          break;
        case 'Date Threshold':
          const val: string = field.state.calcs![config.custom.aggregation];
          let date = dateTimeAsMoment(val);
          if (timeZone === 'utc') {
            date = date.utc();
          }

          displayValue = date.format(config.custom.dateFormat);

          if (val === aliasThresholds.crit) {
            fieldStatus = 'crit';
          } else if (val === aliasThresholds.warn) {
            fieldStatus = 'warn';
          }
          break;
        case 'Disable Criteria':
          if (field.state.calcs![config.custom.aggregation] === config.custom.disabledValue) {
            fieldStatus = 'disable';
          }
          break;
      }
    }
    //Hannah's code
    aliasStatuses[aliasName] = fieldStatus;


    // only display value when appropriate
    const withAlias = config.custom.displayValueWithAlias;
    const isDisplayValue =
      withAlias === 'When Alias Displayed' ||
      (fieldStatus === 'warn' && withAlias === 'Warning / Critical') ||
      (fieldStatus === 'crit' && (withAlias === 'Warning / Critical' || withAlias === 'Critical Only'));

    // apply RegEx if value will be displayed
    if (isDisplayValue && config.custom.valueDisplayRegex) {
      try {
        displayValue = displayValue.replace(new RegExp(config.custom.valueDisplayRegex), '');
      } catch { }
    }

    // get first link and interpolate variables
    const link = ((field.getLinks && field.getLinks({})) ?? [])[0];
    if (link) {
      link.href = replaceVariables(link.href);
    }

    // build props and place in correct bucket
    let props: StatusMetricProp = {
      // alias: config.displayName || df.name || df.refId || '',
      alias: aliasName,
      displayValue: isDisplayValue ? displayValue : undefined,
      link,
    };

    //print the alias name 
    // console.log("Alias:", props.alias);

    // set font format for field
    if (fieldStatus !== 'ok') {
      if (config.custom.fontFormat === 'Bold') {
        props.className = css({ fontWeight: 'bold' });
      } else if (config.custom.fontFormat === 'Italic') {
        props.className = css({ fontStyle: 'italic' });
      }
    }
    // set color for field when colormode is Metric
    if (options.colorMode === 'Metric') {
      props.className = cx(props.className, colorClasses[fieldStatus]);
    }

    // add to appropriate section
    if (fieldStatus === 'ok') {
      if (config.custom.displayType === 'Regular') {
        displays.push(props);
      } else {
        annotations.push(props);
      }
    } else if (fieldStatus === 'warn') {
      warns.push(props);
    } else if (fieldStatus === 'crit') {
      crits.push(props);
    } else if (fieldStatus === 'disable') {
      disables.push(props);
    }
  });
});

  

  
  

  //Hannah's code
  let panelStatus: StatusType = 'ok';
  if (Object.values(aliasStatuses).includes('crit')) {
    panelStatus = 'crit';
  } else if (Object.values(aliasStatuses).includes('warn')) {
    panelStatus = 'warn';
  }

  return { annotations, disables, crits, warns, displays, panelStatus };
}