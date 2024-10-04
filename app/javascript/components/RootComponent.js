import React, { useEffect, useState } from 'react';

const RootComponent = () => {
  const [buildings, setBuildings] = useState();
  const [clients, setClients] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const fetchBuildings = async (page) => {
    if (page === undefined) {
      page = currentPage;
    }
    const response = await fetch(`/buildings?page=${page}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result['status'] == "success") {
      setBuildings(result['buildings']);
    }
  };
  const fetchClients = async () => {
    const response = await fetch(`/clients`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result['status'] == "success") {
      setClients(result['clients']);
    }
  }
  useEffect(() => {
    fetchBuildings(currentPage);
    fetchClients();
  }, []);

  const goToPage = (newPage) => {
    setCurrentPage(newPage);
    fetchBuildings(newPage);
  };

  const saveEditedBuilding = async (editedBuilding) => {
    const { id, ...buildingData } = editedBuilding;
    const response = await fetch(`/buildings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ building: buildingData }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result['status'] == "success") {
      fetchBuildings();
    }
  };
  const saveBuilding = async (newBuilding) => {
    const response = await fetch('/buildings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ building: newBuilding }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result['status'] === 'success') {
      fetchBuildings();
    }
  };

  return (
    <div>
      <h3>Building Listings</h3>
      {(clients === undefined) ? 'Loading...' : <NewBuildingCard clients={clients} saveBuilding={saveBuilding}></NewBuildingCard>}
      <div>
        <p>Page: {currentPage}</p>
        <button disabled={currentPage <= 1} onClick={() => goToPage(currentPage-1)}>previous</button>
        <button disabled={buildings === undefined || buildings.length === 0} onClick={() => goToPage(currentPage+1)}>next</button>
      </div>
      <BuildingCards buildings={buildings} saveEditedBuilding={saveEditedBuilding}></BuildingCards>
    </div>
  );
};

const NewBuildingCard = ({ clients, saveBuilding }) => {
  const [editing, setEditing] = useState(false);
  const [editedBuilding, setEditedBuilding] = useState({
    address: '',
    zipcode: '',
    state_code: '',
    client_name: clients[0].name
  });
  const [availableCustomFields, setAvailableCustomFields] = useState(clients[0].custom_fields);
  const handleInputChange = (key, value) => {
    const newEditedBuilding = { ...editedBuilding };
    if (key === 'client_name') {
      availableCustomFields.forEach(cf => delete newEditedBuilding[cf.name]);
      const newCustomFields = clients.find(clnt => clnt.name === value).custom_fields;
      setAvailableCustomFields(newCustomFields);
      newCustomFields.forEach(cf => {
        if (cf.enum_options) {
          const firstOption = cf.enum_options.split(',')[0];
          newEditedBuilding[cf.name] = firstOption;
        }
      })
    }
    setEditedBuilding({
      ...newEditedBuilding,
      [key]: value,
    });
  };
  if (!editing) {
    return (<button onClick={() => setEditing(true)}>New Listing</button>);
  }
  return (
    <div style={{
        border: '4px',
        borderColor: 'dark-grey',
        borderStyle: 'groove',
        borderRadius: '8px',
        padding: '8px',
        width: '50%',
        margin: '16px',
      }}>
      {['address','zipcode','state_code','client_name'].map((key) => (
        <div key={key}>
          <p>
            {display_custom_field_name(key)}: 
            {(key === 'client_name') ? (
              <select value={editedBuilding[key]} onChange={(e) => handleInputChange(key, e.target.value)}>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type='text'
                value={editedBuilding[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
              />
            )}
          </p>
        </div>
      ))}
      {availableCustomFields.map((customField) => (
        <div key={customField.id}>
          <p>
            {display_custom_field_name(customField.name)}: 
            {(customField.enum_options) ? (
              <select value={editedBuilding[customField.name]} onChange={(e) => handleInputChange(customField.name, e.target.value)}>
                {customField.enum_options.split(',').map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type='text'
                value={editedBuilding[customField.name]}
                onChange={(e) => handleInputChange(customField.name, e.target.value)}
              />
            )}
          </p>
        </div>
      ))}
      <button onClick={() => saveBuilding(editedBuilding)}>Save</button>
    </div>
  );
};

const display_custom_field_name = (key) => {
  return key.charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1);
};

const BuildingCards = ({ buildings, saveEditedBuilding }) => {
  if (buildings === undefined) {
    return <div style={{ padding: '8px', margin: '16px' }}>loading...</div>;
  }
  if (buildings.length === 0) {
    return <div style={{ padding: '8px', margin: '16px' }}>No buildings to display</div>;
  }
  return (
    <div>
      {buildings.map((building) => <BuildingCard key={building.id} building={building} saveEditedBuilding={saveEditedBuilding}></BuildingCard>)}
    </div>
  );
}

const BuildingCard = ({ building, saveEditedBuilding }) => {
  const [editing, setEditing] = useState(false);
  const [editedBuilding, setEditedBuilding] = useState(building);

  const handleInputChange = (key, value) => {
    setEditedBuilding((prevBuilding) => ({
      ...prevBuilding,
      [key]: value,
    }));
  };

  const onSave = () => {
    setEditing(false);
    saveEditedBuilding(editedBuilding);
  }

  if (!editing) {
    return (
      <div
        key={building.id}
        style={{
          border: '4px',
          borderColor: 'dark-grey',
          borderStyle: 'groove',
          borderRadius: '8px',
          padding: '8px',
          width: '50%',
          margin: '16px',
        }}
      >
        {Object.entries(building).map(([key, value]) => (
          <div key={key}>
            <p>
              {display_custom_field_name(key)}: {value}
            </p>
          </div>
        ))}
        <div key='edit_button'>
          <button onClick={() => setEditing(true)}>Edit</button>
        </div>
      </div>
    );
  } else {
    return (
      <div
        key={building.id}
        style={{
          border: '4px',
          borderColor: 'dark-grey',
          borderStyle: 'groove',
          borderRadius: '8px',
          padding: '8px',
          width: '50%',
          margin: '16px',
        }}
      >
        {Object.entries(editedBuilding).map(([key, value]) => {
          if (key === 'id' || key === 'client_name') {
            return (
              <div key={key}>
                <p>
                  {display_custom_field_name(key)}: {value}
                </p>
              </div>
            );
          }
          return (
            <div key={key}>
              <p>
                {display_custom_field_name(key)}:
                <input
                  type='text'
                  value={value}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              </p>
            </div>
          )
        })}
        <div key='save_button'>
          <button onClick={() => onSave()}>Save</button>
        </div>
      </div>
    );
  }
};

export default RootComponent;
