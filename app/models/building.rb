class Building < ApplicationRecord
  belongs_to :client
  has_many :custom_field_values, dependent: :destroy
  has_many :custom_fields, through: :custom_field_values

  def custom_field_names
    custom_fields.map { |cf| cf.name }
  end

  def update_with_custom_fields(building_params)
    ActiveRecord::Base.transaction do
      building_params.each do |key, value|
        if custom_field_names.include?(key)
          set_custom_field_value(key, value)
        end
      end
      update!({
        address: building_params[:address],
        state_code: building_params[:state_code],
        zipcode: building_params[:zipcode]
      })
    end
  end

  def set_custom_field_value(custom_field_name, new_value)
    cfv = custom_field_values.joins(:custom_field).where(custom_field: { name: custom_field_name }).take
    cfv.value = new_value
    cfv.save!
  end
end
