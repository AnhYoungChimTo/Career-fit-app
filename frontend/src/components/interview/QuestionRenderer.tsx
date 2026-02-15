import type { Question } from '../../types';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  error,
}: QuestionRendererProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Your answer..."
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Share your thoughts..."
            required={question.required}
          />
        );

      case 'select':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                  value === option.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center ${
                      value === option.value
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {value === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedValues.filter((v) => v !== option.value));
                    } else {
                      onChange([...selectedValues, option.value]);
                    }
                  }}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-5 h-5 rounded border-2 flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'slider':
        const currentValue = value ?? question.sliderConfig?.min ?? 0;
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              {question.sliderConfig?.labels &&
                Object.entries(question.sliderConfig.labels).map(([key, label]) => (
                  <span key={key}>{label}</span>
                ))}
            </div>
            <input
              type="range"
              min={question.sliderConfig?.min ?? 0}
              max={question.sliderConfig?.max ?? 10}
              step={question.sliderConfig?.step ?? 1}
              value={currentValue}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center text-2xl font-semibold text-indigo-600">
              {currentValue}
            </div>
          </div>
        );

      case 'ranking':
        const rankedItems = Array.isArray(value) ? value : [];
        const unrankedOptions =
          question.options?.filter((opt) => !rankedItems.includes(opt.value)) || [];

        return (
          <div className="space-y-6">
            {/* Ranked items */}
            {rankedItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Your ranking (drag to reorder):
                </h4>
                <div className="space-y-2">
                  {rankedItems.map((itemValue, index) => {
                    const option = question.options?.find(
                      (opt) => opt.value === itemValue
                    );
                    if (!option) return null;

                    return (
                      <div
                        key={itemValue}
                        className="flex items-center p-3 bg-indigo-50 border-2 border-indigo-200 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1">{option.label}</div>
                        <button
                          type="button"
                          onClick={() => {
                            onChange(rankedItems.filter((v) => v !== itemValue));
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unranked options */}
            {unrankedOptions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Click to add to ranking:
                </h4>
                <div className="space-y-2">
                  {unrankedOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange([...rankedItems, option.value]);
                      }}
                      className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-gray-500">
            Question type "{question.type}" not supported
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {question.description && (
          <p className="text-gray-600">{question.description}</p>
        )}
      </div>

      {renderInput()}

      {error && (
        <div className="text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
