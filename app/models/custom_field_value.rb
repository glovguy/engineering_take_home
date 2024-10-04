class CustomFieldValue < ApplicationRecord
  belongs_to :custom_field
  belongs_to :building

  validates :value, presence: true
  validate :value_matches_field_type

  def typed_value
    case custom_field.field_type.to_sym
    when :string, :enum
      value
    when :number
      value.to_f
    end
  end

  def to_s
    "<CustomFieldValue value: #{value}, field_type: #{custom_field.field_type}>"
  end

  private

  def value_matches_field_type
    case custom_field.field_type.to_sym
    when :number
      begin
        Float(value)
      rescue ArgumentError, TypeError
        errors.add(:value, "must be a number")
      end
    when :enum_type
      errors.add(:value, "is not a valid option") unless custom_field.enum_options_array.include?(value)
    end
  end
end
