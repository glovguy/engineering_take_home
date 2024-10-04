class AddIndexesForCustomFields < ActiveRecord::Migration[7.2]
  def change
    # good for querying specific custom_field_values by their custom field id and building
    add_index :custom_field_values, [:custom_field_id, :building_id]
    
    # useful when prefix searching custom_field_values
    # more advanced search use cases will require different approach
    add_index :custom_field_values, :value, length: 10
  end
end
