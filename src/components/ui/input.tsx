"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SharedInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  formatNumber?: boolean;
};

type PhoneChangeEvent = {
  target: { value: string };
  currentTarget: { value: string };
};

type PhoneNumberInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> & {
  className?: string;
  onChange?: (event: PhoneChangeEvent) => void;
};

type Country = {
  name: string;
  flag: string;
  code: string;
  cca2: string;
};

type RestCountry = {
  name: { common: string };
  flags: { svg: string };
  idd?: {
    root?: string;
    suffixes?: string[];
  };
  cca2: string;
};

const Input = React.forwardRef<HTMLInputElement, SharedInputProps>(
  function Input(
    { className, type = "text", formatNumber = false, ...props },
    ref,
  ) {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (type === "number" && formatNumber && props.value !== undefined) {
        const rawValue = Array.isArray(props.value)
          ? props.value[0] ?? ""
          : props.value;
        const stringValue = rawValue == null ? "" : String(rawValue);
        const numValue = parseFloat(stringValue);

        if (!isNaN(numValue)) {
          setDisplayValue(new Intl.NumberFormat("en-US").format(numValue));
        } else {
          setDisplayValue(stringValue);
        }
      }
    }, [props.value, type, formatNumber]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number" && formatNumber) {
        const rawValue = event.target.value.replace(/,/g, "");

        if (rawValue === "" || rawValue === "." || rawValue.endsWith(".")) {
          setDisplayValue(rawValue);
          if (props.onChange) {
            event.target.value = rawValue;
            props.onChange(event);
          }
          return;
        }

        const numValue = parseFloat(rawValue);

        if (!isNaN(numValue)) {
          setDisplayValue(new Intl.NumberFormat("en-US").format(numValue));

          if (props.onChange) {
            event.target.value = rawValue;
            props.onChange(event);
          }
        } else if (rawValue === "") {
          setDisplayValue("");
          if (props.onChange) {
            event.target.value = rawValue;
            props.onChange(event);
          }
        }
        return;
      }

      props.onChange?.(event);
    };

    if (type === "number" && formatNumber) {
      return (
        <input
          ref={ref}
          {...props}
          type="text"
          value={displayValue}
          onChange={handleChange}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className,
          )}
        />
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

function PhoneNumberInput({ className, ...props }: PhoneNumberInputProps) {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredCountries, setFilteredCountries] = React.useState<Country[]>(
    [],
  );
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2",
        );
        const data = (await response.json()) as RestCountry[];

        const formattedCountries = data
          .filter((country) => country.idd?.root && country.idd?.suffixes?.[0])
          .map((country) => ({
            name: country.name.common,
            flag: country.flags.svg,
            code: `${country.idd?.root ?? ""}${
              country.idd?.suffixes?.length === 1
                ? country.idd.suffixes[0]
                : ""
            }`,
            cca2: country.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
        setFilteredCountries(formattedCountries);

        const nigeria =
          formattedCountries.find((country) => country.cca2 === "NG") ?? null;

        if (nigeria) {
          setSelectedCountry(nigeria);
        } else if (formattedCountries.length > 0) {
          setSelectedCountry(formattedCountries[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  React.useEffect(() => {
    if (searchQuery === "") {
      setFilteredCountries(countries);
      return;
    }

    const filtered = countries.filter(
      (country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.includes(searchQuery),
    );
    setFilteredCountries(filtered);
  }, [searchQuery, countries]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
    setSearchQuery("");

    if (!isDropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery("");

    if (phoneNumber && props.onChange) {
      const completeValue = `${country.code} ${phoneNumber}`;
      props.onChange({
        target: { value: completeValue },
        currentTarget: { value: completeValue },
      });
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setPhoneNumber(inputValue);

    if (props.onChange && selectedCountry) {
      const completeValue = `${selectedCountry.code}${
        inputValue.startsWith("0") ? inputValue.slice(1) : inputValue
      }`;
      props.onChange({
        target: { value: completeValue },
        currentTarget: { value: completeValue },
      });
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none !disabled:cursor-not-allowed disabled:opacity-50",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
      >
        <div className="relative">
          <button
            type="button"
            onClick={handleDropdownToggle}
            className="flex h-full items-center border-r border-gray-200 px-2 py-1 hover:bg-gray-50 focus:outline-none"
            disabled={loading}
          >
            {loading ? (
              <div className="h-4 w-6 animate-pulse rounded bg-gray-200" />
            ) : selectedCountry ? (
              <div
                className="h-6 w-6 rounded-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${selectedCountry.flag})` }}
              />
            ) : (
              <div className="h-6 w-6 rounded bg-gray-200" />
            )}
          </button>

          {isDropdownOpen ? (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search countries..."
                  className="h-8"
                />
              </div>

              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.cca2}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="flex w-full items-center px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div
                        className="mr-1.5 h-6 w-6 rounded-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${country.flag})` }}
                      />
                      <span className="flex-1 text-sm">{country.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {country.code}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="flex w-full items-center justify-center p-3 text-sm text-gray-500">
                    {searchQuery
                      ? "No countries found"
                      : "No countries available"}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center px-2 text-sm text-gray-600">
          {selectedCountry?.code || "+234"}
        </div>

        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="flex-1 bg-transparent py-1 pr-3 text-base outline-none md:text-sm"
          data-slot="input"
          name={props.name}
          id={props.id}
          aria-describedby={props["aria-describedby"]}
        />
      </div>

      {isDropdownOpen ? (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      ) : null}
    </div>
  );
}

function PasswordInput({ className, ...props }: SharedInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOffIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </button>
    </div>
  );
}

export { Input, PhoneNumberInput, PasswordInput };
