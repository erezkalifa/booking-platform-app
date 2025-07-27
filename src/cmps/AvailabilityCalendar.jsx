import { useState, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../assets/styles/cmps/AvailabilityCalendar.css";

export function AvailabilityCalendar({
  availableDates = [],
  onDateRangeSelect,
}) {
  // State for selected date range
  const [dateRange, setDateRange] = useState(null);

  // Convert a Date object to YYYY-MM-DD string format
  const formatDate = useCallback((date) => {
    return date ? date.toISOString().split("T")[0] : "";
  }, []);

  // Check if a date is included in availableDates
  const isDateAvailable = useCallback(
    (date) => {
      const dateString = formatDate(date);
      return availableDates.includes(dateString);
    },
    [availableDates, formatDate]
  );

  // Disable dates that aren't in availableDates array
  const tileDisabled = useCallback(
    ({ date, view }) => {
      // Only check availability for day view
      if (view === "month") {
        // Disable past dates
        if (date < new Date().setHours(0, 0, 0, 0)) {
          return true;
        }
        // Disable unavailable dates
        return !isDateAvailable(date);
      }
      return false;
    },
    [isDateAvailable]
  );

  // Add custom classes to calendar tiles
  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === "month") {
        return isDateAvailable(date)
          ? "react-calendar__tile--available"
          : "react-calendar__tile--unavailable";
      }
      return null;
    },
    [isDateAvailable]
  );

  // Handle date range selection
  const handleDateChange = (value) => {
    // value is an array of [startDate, endDate] when selectRange is true
    setDateRange(value);

    // Only notify parent if we have both dates
    if (Array.isArray(value) && value[0] && value[1]) {
      onDateRangeSelect({
        checkIn: value[0],
        checkOut: value[1],
      });
    }
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        selectRange={true}
        onChange={handleDateChange}
        value={dateRange}
        tileDisabled={tileDisabled}
        tileClassName={tileClassName}
        minDate={new Date()} // Prevent selecting past dates
        minDetail="month" // Don't allow drilling down to decade/century view
        showNeighboringMonth={false} // Hide days from neighboring months
        formatShortWeekday={(locale, date) =>
          date.toLocaleDateString(locale, { weekday: "short" }).slice(0, 2)
        }
      />
    </div>
  );
}
