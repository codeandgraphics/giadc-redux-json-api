import pluralize from 'pluralize';

export const getEntity = (state, key, id) => {
    let pluralKey = pluralize(key);

    if (!state[pluralKey] || !state[pluralKey][id]) {
        return null;
    }

    return state[pluralKey][id];
}

export const getEntities = (state, key, ids = null) => {
    let pluralKey = pluralize(key);

    if (ids === null) {
        const data = state[pluralKey];

        if (!data) {
            return [];
        }

        return Object.keys(data).map((id) => data[id]);
    }

    let returnedEntities = [];

    ids.forEach((id) => {
        let entity = getEntity(state, key, id);

        if (entity) {
            returnedEntities.push(entity);
        }
    });

    return returnedEntities;
}

export const getId = (jsonData) => {
    return jsonData.data.id;
}

export const getIds = (jsonData) => {
    return jsonData.data.map((entity) => entity.id);
}