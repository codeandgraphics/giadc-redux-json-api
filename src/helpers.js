import pluralize from 'pluralize';
import uuid from 'uuid';

import reduce from 'lodash/reduce';
import isPlainObject from 'lodash/isPlainObject';
import camelCase from 'lodash/camelCase';

const deepRename = (entity, modifier) =>
    reduce(
        entity,
        (result, value, key) => {
            const newKey = modifier(key) || key;
            const newResult = result;

            if (isPlainObject(value)) {
                newResult[newKey] = deepRename(value, modifier);
            } else {
                newResult[newKey] = value;
            }

            return newResult;
        },
        {}
    );

/**
 * Grab an Entity from the state
 *
 * @param  {Object} state
 * @param  {String} key
 * @param  {String} id
 * @return {Object}
 */
export const getEntity = (state, key, id) => {
    const pluralKey = pluralize(key);
    const entity = state.getIn([pluralKey, 'byId', id, 'data']);


    return entity === undefined
        ? undefined
        : {
            ...entity.toJS(),
            id,
        };
};

/**
 * Grab an Entity from the state with relationships
 *
 * @param  {Object} state
 * @param  {String} key
 * @param  {String} id
 * @param  {*} relations
 * @return {Object}
 */
export const getEntityWithRelationships = (state, key, id, relations = null) => {
    const entity = getEntity(state, key, id);

    if (Array.isArray(relations)) {
        const relationships = relations.reduce((result, relation) => ({
            ...result,
            [relation]: getRelationships(state, relation, entity),
        }), {});

        return {
            ...entity,
            ...relationships,
        };
    } else if (typeof relations === 'string') {
        return {
            ...entity,
            [relations]: getRelationships(state, relations, entity),
        };
    }

    return entity;
};

const getRelationships = (state, relation, entity) => {
    const relationIds = entity[relation];
    if (Array.isArray(relationIds)) {
        return getEntities(state, relation, relationIds);
    }

    return getEntity(state, relation, relationIds);
};

/**
 * Get an array of Entities from the state
 *
 * @param  {Object}     state
 * @param  {String}     key
 * @param  {Array|null} ids
 * @return {Array}
 */
export const getEntities = (state, key, ids = null) => {
    const pluralKey = pluralize(key);

    if (ids === null) {
        if (!state.hasIn([pluralKey, 'byId'])) {
            return [];
        }

        const idsToFetch = state
            .getIn([pluralKey, 'byId'])
            .keySeq()
            .toArray();

        return idsToFetch.map(id => getEntity(state, pluralKey, id));
    }

    return ids.map(id => getEntity(state, key, id)).filter(entity => !!entity);
};

/**
 * Get an array of Entities from the state with multiple relationships
 *
 * @param  {Object}     state
 * @param  {String}     key
 * @param  {Array|null} ids
 * @param  {*|null}     relations
 * @return {Array}
 */
export const getEntitiesWithRelationships = (state, key, ids = null, relations = null) => {
    const pluralKey = pluralize(key);

    if (ids === null) {
        if (!state.hasIn([pluralKey, 'byId'])) {
            return [];
        }

        const idsToFetch = state
            .getIn([pluralKey, 'byId'])
            .keySeq()
            .toArray();

        return idsToFetch.map(id => getEntityWithRelationships(state, pluralKey, id, relations));
    }

    return ids.map(id => getEntityWithRelationships(state, key, id, relations)).filter(entity => !!entity);
};

/**
 * Grab the ID from JSON API response containing a single Entity
 *
 * @param  {Object} jsonData
 * @return {String}
 */
export const getId = jsonData => jsonData.data.id;

/**
 * Grab the ID's from a JSON API response containing an array of Entities
 *
 * @param  {Object} jsonData
 * @return {Array}
 */
export const getIds = jsonData => jsonData.data.map(entity => entity.id);

/**
 * Grab an Entity group's meta data from the state
 *
 * @param  {Object} state
 * @param  {String} entityKey
 * @param  {String} metaKey
 * @return {*}
 */
export const getEntitiesMeta = (state, entityKey, metaKey = null) =>
    (metaKey === null
        ? state.getIn([entityKey, 'meta']) &&
        state.getIn([entityKey, 'meta']).toJS()
        : state.getIn([entityKey, 'meta', metaKey]));

/**
 * Grab an Entity's meta data from the state
 *
 * @param  {Object} state
 * @param  {String} entityKey
 * @param  {String} entityId
 * @param  {String} metaKey
 * @return {*}
 */
export const getEntityMeta = (state, entityKey, entityId, metaKey = null) =>
    (metaKey === null
        ? state.getIn([entityKey, 'byId', entityId, 'meta']) &&
        state.getIn([entityKey, 'byId', entityId, 'meta']).toJS()
        : state.getIn([entityKey, 'byId', entityId, 'meta', metaKey]));

/**
 * Generate a valid Entity with the given attributes
 *
 * @param  {String} entityKey
 * @param  {Object} attributes
 * @return {Object}
 */
export const generateEntity = (entityKey, attributes) => {
    const id = attributes.id || uuid.v4();

    return {
        type: entityKey,
        id,
        attributes: Object.keys(attributes)
            .filter(key => key !== 'id')
            .reduce((carrier, key) => ({ ...carrier, [key]: attributes[key] }), {}),
    };
};

/**
 * Transform all entity keys into camelCase
 *
 * @param {Object} entity
 * @return {Object}
 */
export const camelizeEntity = entity => deepRename(entity, camelCase);
