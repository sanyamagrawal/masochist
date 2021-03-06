import React from 'react';
import Relay from 'react-relay';
import ifMounted from '../ifMounted';
import DocumentTitle from './DocumentTitle';
import LoadMoreButton from './LoadMoreButton';
import Post from './Post';

class PostsIndex extends React.Component {
  // TODO: DRY up this pagination pattern
  constructor(props) {
    super(props);
    this.state = {isLoading: false};
  }

  _handleLoadMore = () => {
    this.props.relay.setVariables({
      count: this.props.relay.variables.count + 10,
    }, ifMounted(this, ({ready, done, error, aborted}) => {
      this.setState({isLoading: !ready && !(done || error || aborted)});
    }));
  }

  componentDidMount() {
    ifMounted.register(this);
  }

  componentWillUnmount() {
    ifMounted.unregister(this);
  }

  render() {
    return (
      <DocumentTitle title="blog">
        <div>
          {
            this.props.viewer.posts.edges.map(({node}) => (
              <Post key={node.id} post={node} />
            ))
          }
          {
            this.props.viewer.posts.pageInfo.hasNextPage ?
              <LoadMoreButton
                isLoading={this.state.isLoading}
                onLoadMore={this._handleLoadMore}
              /> :
              null
          }
        </div>
      </DocumentTitle>
    );
  }
}

export default Relay.createContainer(PostsIndex, {
  initialVariables: {
    count: 3,
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        posts(first: $count) {
          edges {
            node {
              id
              ${Post.getFragment('post')}
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
  },
});
