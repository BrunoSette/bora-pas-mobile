import React from 'react'
import { storage } from '../firebase/firebaseContext';

export function useGetUserImages(user,id, callback, sort=true) {
      storage
        .ref(`/users/${id}/profileImage`)
        .getDownloadURL()
        .then((url) => {
          user = { ...user, image: url };

          if(sort) {
            callback((users) => {
              return [...users, user]
                .sort((a, b) => {
                  return b.points - a.points;
                })
                .filter((user) => {
                  return user.points !== 0;
                });
            });
          } else {
            callback((users) => {
              return [...users, user]
            })
          }
          
        });
    
        return null
}
