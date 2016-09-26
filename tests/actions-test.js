import { expect } from 'chai';
import * as actions from '../lib/actions';
import { actionNames } from '../lib/constants';

describe('actions', () => {
    it('should create an action to load json api data', () => {
        const data = {
            data: {
                type: 'article',
                id: '12345',
                attributes: {
                    title: 'Test Title'
                }
            }
        };
        const expectedAction = {
          type: actionNames.LOAD_JSON_API_ENTITY_DATA,
          data
        };
        expect(actions.loadJsonApiEntityData(data)).to.eql(expectedAction);
    });

    it('should create an action to add a relationship to an entity', () => {
        const entityKey = 'articles';
        const entityId = '1';
        const relationshipKey = 'reader';
        const relationshipObject = {
            type: 'user',
            id: '54321',
            attributes: {
                name: 'Bob Ross'
            }
        };
        const expectedAction = {
            type: actionNames.ADD_RELATIONSHIP_TO_ENTITY,
            entityKey,
            entityId,
            relationshipKey, 
            relationshipObject
        };
        expect(actions.addRelationshipToEntity(entityKey, entityId, relationshipKey, relationshipObject)).to.eql(expectedAction);
    });

    it('should create an action to remove a relationship from an entity', () => {
        const entityKey = 'articles';
        const entityId = '1';
        const relationshipKey = 'reader';
        const relationshipId = '54321';
        const expectedAction = {
            type: actionNames.REMOVE_RELATIONSHIP_FROM_ENTITY,
            entityKey,
            entityId,
            relationshipKey, 
            relationshipId
        };
        expect(actions.removeRelationshipFromEntity(entityKey, entityId, relationshipKey, relationshipId)).to.eql(expectedAction);
    });

    it('should create an action to update an entity', () => {
        const entityKey = 'articles';
        const entityId = '1';
        const data = {
            title: 'New Test Title'
        };
        const expectedAction = {
            type: actionNames.UPDATE_ENTITY,
            entityKey,
            entityId,
            data 
        };
        expect(actions.updateEntity(entityKey, entityId, data)).to.eql(expectedAction);
    });
});