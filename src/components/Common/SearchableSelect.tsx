'use client';

import React, { useRef, useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import CreatableSelect from 'react-select/async-creatable';

interface ServerSearchSelectProps {
  placeholder?: string;
  value: any;
  onChange: (value: any) => void;
  fetchOptions: (inputValue: string, config?: any) => Promise<any>;
  getOptionLabel?: (item: any) => string;
  getOptionValue?: (item: any) => string | number;
  isMulti?: boolean;
  isDisabled?: boolean;
  isCreatable?: boolean;
  onCreateOption?: (inputValue: string) => Promise<any>;
}

const ServerSearchSelect = ({
  placeholder = 'Search...',
  value,
  onChange,
  fetchOptions,
  getOptionLabel = (item: any) => item.name,
  getOptionValue = (item: any) => item.id,
  isMulti = false,
  isDisabled = false,
  isCreatable = false,
  onCreateOption,
}: ServerSearchSelectProps) => {
  const abortRef = useRef<AbortController | null>(null);
  const [selectValue, setSelectValue] = useState<any>(value);

  /* ================= SYNC VALUE ================= */

  useEffect(() => {
    setSelectValue(value);
  }, [value]);

  /* ================= LOAD OPTIONS ================= */

  const loadOptions = async (inputValue: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetchOptions(inputValue, {
        signal: controller.signal,
      });

      const items = res?.data?.items ?? res?.items ?? res ?? [];

      return items.map((item: any) => ({
        label: getOptionLabel(item),
        value: getOptionValue(item),
        original: item,
      }));
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        return [];
      }
      console.error('Dropdown fetch error:', error);
      return [];
    }
  };

  /* ================= CREATE OPTION ================= */

  const handleCreateOption = async (inputValue: string) => {
    if (!onCreateOption) return;

    try {
      const response = await onCreateOption(inputValue);
      const newItem = response?.data || response;

      if (!newItem) return;

      const newOption = {
        label: getOptionLabel(newItem),
        value: getOptionValue(newItem),
        original: newItem,
      };

      setSelectValue(newOption);
      onChange(newOption);

      return newOption;
    } catch (error) {
      console.error('Create option error:', error);
    }
  };

  /* ================= CHANGE ================= */

  const handleChange = (newValue: any) => {
    setSelectValue(newValue);
    onChange(newValue);
  };

  /* ================= SELECT TYPE ================= */

  const canCreate = isCreatable && typeof onCreateOption === 'function';
  const SelectComponent = canCreate ? CreatableSelect : AsyncSelect;

  /* ================= UI ================= */

  return (
    <SelectComponent
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      value={selectValue}
      isDisabled={isDisabled}
      onChange={handleChange}
      placeholder={placeholder}
      isClearable
      isMulti={isMulti}
      onCreateOption={canCreate ? handleCreateOption : undefined}
      formatCreateLabel={
        canCreate ? (inputValue) => `Create "${inputValue}"` : undefined
      }
      noOptionsMessage={({ inputValue }) =>
        inputValue
          ? canCreate
            ? `No results found. Create "${inputValue}"`
            : 'No results found'
          : 'Type to search...'
      }
      closeMenuOnSelect={!isMulti}
      blurInputOnSelect={!isMulti}
    />
  );
};

export default ServerSearchSelect;
