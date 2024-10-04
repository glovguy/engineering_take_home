# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

custom_field_examples = [
  {
    name: 'type_of_walkway',
    field_type: :enum_type,
    enum_options: :'brick,concrete,none'
  },
  {
    name: 'size_of_fridge',
    field_type: :enum_type,
    enum_options: :'small,medium,large'
  },
  {
    name: 'living_room_floor_material',
    field_type: :enum_type,
    enum_options: :'hardwood,carpet,tile'
  },
  {
    name: 'living_room_color',
    field_type: :string
  },
  {
    name: 'school_district',
    field_type: :string
  },
  {
    name: 'kitchen_paint_color',
    field_type: :string
  },
  {
    name: 'nickname_of_resident_poltergeist',
    field_type: :string
  },
  {
    name: 'number_of_bathrooms',
    field_type: :number
  },
  {
    name: 'number_of_sinks',
    field_type: :number
  },
  {
    name: 'number_of_staircases',
    field_type: :number
  },
  {
    name: 'size_of_kitchen_(square_ft.)',
    field_type: :number
  },
  {
    name: 'number_of_bedrooms',
    field_type: :number
  },
  {
    name: 'backyard_size_(square_ft.)',
    field_type: :number
  },
  {
    name: 'garage_size_(square_ft.)',
    field_type: :number
  },
  {
    name: 'roof_material',
    field_type: :string
  },
  {
    name: 'number_of_windows',
    field_type: :number
  },
  {
    name: 'swimming_pool',
    field_type: :enum_type,
    enum_options: :'above_ground,installed,none'
  },
  {
    name: 'number_of_floors',
    field_type: :number
  },
  {
    name: 'attic_size_(square_ft.)',
    field_type: :number
  }
]

def generate_random_string
  length = rand(3..7)
  prefixes = ['un', 're', 'in', 'dis', 'en', 'non', 'inter', 'over', 'sub', 'trans', 'super']
  suffixes = ['able', 'ible', 'al', 'ial', 'ed', 'en', 'er', 'est', 'ful', 'ic', 'ing', 'ion', 'ive', 'less', 'ly', 'ous', 'ness', 'ship', 'ty', 'ize']
  vowel_combos = ['ea', 'ee', 'oo', 'ou', 'ie', 'ai', 'ei']
  charset = prefixes + suffixes + vowel_combos
  Array.new(length) { charset.sample }.join
end

def custom_field_test_value(custom_field)
  case custom_field.field_type.to_sym
  when :enum_type
    custom_field.enum_options_array.sample
  when :string
    generate_random_string
  when :number
    rand(1.0..10.0)
  end
end

CustomField.destroy_all

['Acme', 'Smith Holdings', "Mom's Real Estate", 'Homer Inc.', "Howl's Magic Real Estate", 'ZZ Real Estate'].each do |client_name|
  client = Client.find_or_create_by!(name: client_name)
  
  # since these are randomly picked, find_or_create_by! is not idempotent
  # instead, just start from scratch each time
  client.custom_fields.destroy_all

  # pick 3 randomly from custom_field_examples
  custom_field_examples.sample(3).each do |custom_field_hash|
    CustomField.find_or_create_by!(
      **custom_field_hash,
      client_id: client.id
    )
  end
  client.reload
  
  # Seed buildings for each client
  15.times do |i|
    building = Building.find_or_create_by!(
      address: "#{i+1}#{i+1}#{i+1} main st.",
      state_code: 'NY',
      zipcode: "1000#{i+1}",
      client_id: client.id
    )
    client.custom_fields.each do |cf|
      test_value = custom_field_test_value(cf)
      cfv = CustomFieldValue.find_or_create_by!(
        custom_field_id: cf.id,
        building_id: building.id,
        value: test_value
      )
    end
  end
end
