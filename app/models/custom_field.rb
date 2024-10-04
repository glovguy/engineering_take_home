class CustomField < ApplicationRecord
  belongs_to :client
  has_many :custom_field_values, dependent: :destroy

  validates :name, presence: true
  validates :field_type, presence: true
  validate :ensure_enum_options_present_if_enum

  enum field_type: { string: 'string', number: 'number', enum_type: 'enum_type' }
  
  def enum_options_array
    return [] unless field_type == 'enum_type'
    enum_options.split(',').map(&:strip)
  end

  def to_s
    "<CustomField name: #{name}, field_type: #{field_type}>"
  end

  private

  def ensure_enum_options_present_if_enum
    if enum_type? && enum_options.blank?
      errors.add(:enum_options, "can't be blank for enum field type")
    end
  end
end
