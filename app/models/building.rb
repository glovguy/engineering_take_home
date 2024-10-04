class Building < ApplicationRecord
  has_many :custom_field_values, dependent: :destroy
end
