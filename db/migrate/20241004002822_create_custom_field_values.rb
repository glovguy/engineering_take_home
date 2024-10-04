class CreateCustomFieldValues < ActiveRecord::Migration[7.2]
  def change
    create_table :custom_field_values do |t|
      t.references :custom_field, null: false, foreign_key: true
      t.references :building, null: false, foreign_key: true
      t.text :value

      t.timestamps
    end
  end
end
