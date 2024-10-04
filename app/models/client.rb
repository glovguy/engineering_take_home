class Client < ApplicationRecord
  has_many :custom_fields, dependent: :destroy
end
