class CustomFieldValue < ApplicationRecord
  belongs_to :custom_field
  belongs_to :building

  validates :value, presence: true

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
      errors.add(:value, "must be a number") unless value.to_f.to_s == value
    when :enum
      errors.add(:value, "is not a valid option") unless custom_field.enum_options_array.include?(value)
    end
  end
end
