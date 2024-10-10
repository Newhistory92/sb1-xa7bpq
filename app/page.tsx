'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
      createdAt
      updatedAt
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!) {
    createPost(title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

const UPDATE_POST = gql`
  mutation UpdatePost($id: Int!, $title: String!, $content: String!) {
    updatePost(id: $id, title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

const DELETE_POST = gql`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id) {
      id
    }
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(GET_POSTS);
  const [createPost] = useMutation(CREATE_POST);
  const [updatePost] = useMutation(UPDATE_POST);
  const [deletePost] = useMutation(DELETE_POST);
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  const handleCreatePost = async () => {
    try {
      await createPost({
        variables: { title, content },
        refetchQueries: [{ query: GET_POSTS }],
      });
      setTitle('');
      setContent('');
      toast({
        title: 'Post created',
        description: 'Your post has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error creating your post.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePost = async () => {
    try {
      await updatePost({
        variables: { id: editingPost.id, title, content },
        refetchQueries: [{ query: GET_POSTS }],
      });
      setEditingPost(null);
      setTitle('');
      setContent('');
      toast({
        title: 'Post updated',
        description: 'Your post has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error updating your post.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await deletePost({
        variables: { id },
        refetchQueries: [{ query: GET_POSTS }],
      });
      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error deleting your post.',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">GraphQL CRUD App</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-2"
        />
        <Button onClick={editingPost ? handleUpdatePost : handleCreatePost}>
          {editingPost ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{post.content}</p>
              <div className="mt-4 flex justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingPost(post);
                        setTitle(post.title);
                        setContent(post.content);
                      }}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Post</DialogTitle>
                    </DialogHeader>
                    <Input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mb-2"
                    />
                    <Textarea
                      placeholder="Content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="mb-2"
                    />
                    <Button onClick={handleUpdatePost}>Update Post</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => handleDeletePost(post.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}