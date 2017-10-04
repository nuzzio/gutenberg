/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { first, last } from 'lodash';
import { Slot } from 'react-slot-fill';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, findDOMNode } from '@wordpress/element';
import { KeyboardShortcuts } from '@wordpress/components';
import { BlockControls } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import VisualEditorBlockList from './block-list';
import VisualEditorInserter from './inserter';
import PostTitle from '../../post-title';
import WritingFlow from '../../writing-flow';
import TableOfContents from '../../table-of-contents';
import FeatureToggle from '../../feature-toggle';
import PostPermalink from '../../post-permalink';
import { getBlockUids, getMultiSelectedBlockUids, isFeatureActive, getSelectedBlock } from '../../selectors';
import { clearSelectedBlock, multiSelect, redo, undo, removeBlocks } from '../../actions';

class VisualEditor extends Component {
	constructor() {
		super( ...arguments );
		this.bindContainer = this.bindContainer.bind( this );
		this.bindBlocksContainer = this.bindBlocksContainer.bind( this );
		this.onClick = this.onClick.bind( this );
		this.selectAll = this.selectAll.bind( this );
		this.undoOrRedo = this.undoOrRedo.bind( this );
		this.deleteSelectedBlocks = this.deleteSelectedBlocks.bind( this );
	}

	componentDidMount() {
		document.addEventListener( 'keydown', this.onKeyDown );
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.onKeyDown );
	}

	bindContainer( ref ) {
		this.container = ref;
	}

	bindBlocksContainer( ref ) {
		this.blocksContainer = findDOMNode( ref );
	}

	onClick( event ) {
		if ( event.target === this.container || event.target === this.blocksContainer ) {
			this.props.clearSelectedBlock();
		}
	}

	selectAll( event ) {
		const { uids, onMultiSelect } = this.props;
		event.preventDefault();
		onMultiSelect( first( uids ), last( uids ) );
	}

	undoOrRedo( event ) {
		const { onRedo, onUndo } = this.props;
		if ( event.shiftKey ) {
			onRedo();
		} else {
			onUndo();
		}

		event.preventDefault();
	}

	deleteSelectedBlocks( event ) {
		const { multiSelectedBlockUids, onRemove } = this.props;
		if ( multiSelectedBlockUids.length ) {
			event.preventDefault();
			onRemove( multiSelectedBlockUids );
		}
	}

	render() {
		const { hasFixedToolbar, selectedBlock } = this.props;
		// Disable reason: Clicking the canvas should clear the selection
		/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
		return (
			<div
				role="region"
				aria-label={ __( 'Editor content' ) }
				className="editor-visual-editor"
				onMouseDown={ this.onClick }
				onTouchStart={ this.onClick }
				onKeyDown={ this.onKeyDown }
				ref={ this.bindContainer }
			>
				{ ! selectedBlock && hasFixedToolbar &&
					<BlockControls>
						<PostPermalink />
					</BlockControls>
				}
				<div className="editor-visual-editor__header">
					{ hasFixedToolbar &&
						<div className="editor-visual-editor__block-toolbar">
							<div className="editor-visual-editor__block-toolbar-content">
								<Slot name="Block.Toolbar" />
							</div>
						</div>
					}
					<div className="editor-visual-editor__subtoolbar">
						<FeatureToggle feature="fixedToolbar" label="Fixed Toolbar" />
						<TableOfContents />
					</div>
				</div>
				<KeyboardShortcuts shortcuts={ {
					'mod+a': this.selectAll,
					'mod+z': this.undoOrRedo,
					'mod+shift+z': this.undoOrRedo,
					backspace: this.deleteSelectedBlocks,
					del: this.deleteSelectedBlocks,
				} } />
				<WritingFlow>
					<PostTitle />
					<VisualEditorBlockList ref={ this.bindBlocksContainer } />
				</WritingFlow>
				<VisualEditorInserter />
			</div>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
	}
}

export default connect(
	( state ) => {
		return {
			uids: getBlockUids( state ),
			multiSelectedBlockUids: getMultiSelectedBlockUids( state ),
			hasFixedToolbar: isFeatureActive( state, 'fixedToolbar' ),
			selectedBlock: getSelectedBlock( state ),
		};
	},
	{
		clearSelectedBlock,
		onMultiSelect: multiSelect,
		onRedo: redo,
		onUndo: undo,
		onRemove: removeBlocks,
	}
)( VisualEditor );
