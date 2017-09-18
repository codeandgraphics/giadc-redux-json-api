import { expect } from 'chai';
import { Map, Set } from 'immutable';

import { reducer } from '../src';
import actionNames from '../src/action-names';
import { commentJsonResponse, initialJsonApiResponse, serverSideRendering } from './exampleData';

const initialExpectedState = reducer(Map({}), {
    type: actionNames.LOAD_DATA,
    data: initialJsonApiResponse
});

describe('reducer', () => {
    it('should return the initial state', () => {
        const result = reducer(undefined);
        expect(Map.isMap(result)).to.equal(true);
        expect(result.isEmpty()).to.equal(true);
    });

    it('should convert a provided JS state to a Map', () => {
        const result = reducer(serverSideRendering);
        expect(Map.isMap(result)).to.equal(true);
        expect(Set.isSet(
            result.getIn(['users', 'byId', 'ec9f2054-87e1-11e5-92bb-04016484ad01', 'data', 'permissions'])
        ));
    });

    it('should handle an initial LOAD_DATA', () => {
        expect(Map.isMap(initialExpectedState)).to.be.true;
        expect(initialExpectedState.keySeq().toArray().sort()).to.eql(['articles', 'comments', 'people']);
        expect(Map.isMap(initialExpectedState.get('articles'))).to.be.true;
        expect(Map.isMap(initialExpectedState.get('comments'))).to.be.true;
        expect(Map.isMap(initialExpectedState.get('people'))).to.be.true;

        expect(initialExpectedState.getIn(['articles', 'byId', '1', 'relationships', 'author', 'id'])).to.equal('9');
        expect(
            initialExpectedState.getIn(['articles', 'byId', '1', 'relationships', 'comments'])
                .map(comment => comment.get('id'))
                .toArray()
            ).to.eql(['5', '12']);
    });
    
    it('should handle an additional LOAD_DATA', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.LOAD_DATA,
            data: commentJsonResponse,
        });

        expect(result.hasIn(['comments', 'byId', '44'])).to.be.true;
        expect(result.getIn(['comments', 'byId', '44', 'attributes', 'body'])).to.eql('This is a terrible comment');
        expect(result.getIn(['comments', 'byId', '44', 'relationships', 'author', 'id'])).to.eql('9');
    });

    it('should handle ADD_RELATIONSHIP', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.ADD_RELATIONSHIP + '_ARTICLE_COMMENTS',
            entityKey: 'article',
            entityId: '1',
            relationshipKey: 'comments',
            relationshipObject: commentJsonResponse,
        });

        expect(result.hasIn(['comments', 'byId', '44'])).to.be.true;
        expect(
            result
                .getIn(['articles', 'byId', '1', 'relationships', 'comments'])
                .map(comment => comment.get('id'))
                .toArray()
            ).to.eql(['5', '12', '44']);
    });

    it('should handle REMOVE_RELATIONSHIP', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.REMOVE_RELATIONSHIP + '_ARTICLE_COMMENTS',
            entityKey: 'article',
            entityId: '1',
            relationshipKey: 'comments',
            relationshipId: '5'
        });

        expect(
            result.getIn(['articles', 'byId', '1', 'relationships', 'comments'])
                .map(comment => comment.get('id'))
                .toArray()
        ).to.eql(['12']);
    });

    it('should handle UPDATE_ENTITY', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.UPDATE_ENTITY + '_ARTICLE',
            entityKey: 'article',
            entityId: '1',
            data: {
                title:'JSON API does not paint my bikeshed!'
            }
        });

        expect(result.getIn(['articles', 'byId', '1', 'attributes', 'title'])).to.eql('JSON API does not paint my bikeshed!');
    });

    it('should handle UPDATE_ENTITIES_META and replace a single metadata property', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.UPDATE_ENTITIES_META + '_ARTICLES',
            entityKey: 'article',
            metaKey: 'randomMetaKey',
            value: true,
        });

        expect(result.getIn(['articles', 'meta', 'randomMetaKey'])).to.equal(true);
    });

    it('should handle UPDATE_ENTITIES_META and completely replace the meta object', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.UPDATE_ENTITIES_META + '_ARTICLES',
            entityKey: 'article',
            metaKey: null,
            value: { newMetaProperty: 'newMetaValue' },
        });

        expect(result.getIn(['articles', 'meta']).toObject()).to.eql({ newMetaProperty: 'newMetaValue' });
    });

    it('should handle UPDATE_ENTITY_META and replace a single metadata property', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.UPDATE_ENTITY_META + '_ARTICLE',
            entityKey: 'article',
            entityId: '1',
            metaKey: 'isLoading',
            value: true,
        });

        expect(result.getIn(['articles', 'byId', '1', 'meta', 'isLoading'])).to.equal(true);
    });

    it('should handle UPDATE_ENTITY_META and completely replace the meta object', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.UPDATE_ENTITY_META + '_ARTICLE',
            entityKey: 'article',
            entityId: '1',
            metaKey: null,
            value: { randomMetaKey: true },
        });

        expect(result.getIn(['articles', 'byId', '1', 'meta']).toObject()).to.eql({ randomMetaKey: true });
    });

    it('should handle REMOVE_ENTITY', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.REMOVE_ENTITY + '_ARTICLE',
            entityKey: 'article',
            entityId: '1',
        });
        expect(result.getIn(['articles', 'byId']).isEmpty()).to.equal(true);
    });

    it('should handle CLEAR_ENTITY_TYPE', () => {
        const result = reducer(initialExpectedState, {
            type: actionNames.CLEAR_ENTITY_TYPE + '_ARTICLES',
            entityKey: 'articles',
        });

        expect(result.get('articles')).to.equal(undefined);
    });
});
