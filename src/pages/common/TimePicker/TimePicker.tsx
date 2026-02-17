"use client";

import dayjs, { Dayjs } from "dayjs";
import { useState, useEffect } from "react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

interface HourOnlyTimePickerProps {
    label?: string;
    value: string;
    onChange: (time: string) => void;
}

const HourOnlyTimePicker = ({
    label,
    value,
    onChange,
}: HourOnlyTimePickerProps) => {
    const [time, setTime] = useState<Dayjs | null>(null);

    // Convert time string (e.g., "10:00 AM") to Dayjs object
    const parseTimeString = (timeStr: string): Dayjs | null => {
        if (!timeStr) return null;
        
        try {
            const [timePart, period] = timeStr.split(" ");
            const [hoursStr, minutesStr] = timePart.split(":");
            
            let hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr || "0", 10);
            
            // Convert 12-hour format to 24-hour format
            if (period?.toUpperCase() === "PM" && hours !== 12) {
                hours += 12;
            } else if (period?.toUpperCase() === "AM" && hours === 12) {
                hours = 0;
            }
            
            return dayjs().hour(hours).minute(minutes).second(0);
        } catch (error) {
            console.error("Error parsing time:", error);
            return null;
        }
    };

    // Initialize time from value prop
    useEffect(() => {
        if (value) {
            const parsedTime = parseTimeString(value);
            if (parsedTime) {
                setTime(parsedTime);
            }
        }
    }, [value]);

    const handleChange = (newValue: Dayjs | null) => {
        if (!newValue) return;

        setTime(newValue);

        const hour24 = newValue.hour();
        const minute = newValue.minute();

        const hour12 = hour24 % 12 || 12;
        const ampm = hour24 < 12 ? "AM" : "PM";

        const finalTime = `${hour12}:${minute
            .toString()
            .padStart(2, "0")} ${ampm}`;

        onChange(finalTime);
    };

    return (
        <div className="timeCustom">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                    className="checkTime"
                    label={label}
                    value={time}
                    onChange={handleChange}
                    slotProps={{
                        textField: { fullWidth: true },
                    }}
                />
            </LocalizationProvider>
        </div>
    );
};

export default HourOnlyTimePicker;