const container = document.getElementById('container');
                let renderedPosts = 10;
                const MAX_POSTS_NUMBER = 50;
                const INIT_POSTS_NUMBER = 10;

window.onload = () => {
                    return fetch('https://api.myjson.com/bins/152f9j').then((result) => {
                        return result.json()
                    }).then((result) => {
                        const data = result.data;
                        let posts = [];

                        // initially sort newest first and render 10 posts
                        if (localStorage.getItem("sortMode") == "oldestFirst") {
                            sortOldestFirst(data);
                            render10items(data);
                        } else {
                            sortNewestFirst(data);
                            render10items(data);
                        }

                        // add event listeners

                        // sort newest first event
                        const sortNewestFirstButton = document.getElementById('sortNewestFirst');
                        sortNewestFirstButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            container.innerHTML = '<h3><hr></h3>';
                            posts = [];
                            renderedPosts = INIT_POSTS_NUMBER;
                            sortNewestFirst(data);
                            render10items(data);
                            localStorage.setItem("sortMode", "newestFirst");
                        });

                        // sort oldest first event
                        const sortOldestFirstButton = document.getElementById('sortOldestFirst');
                        sortOldestFirstButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            container.innerHTML = '<h3><hr></h3>';
                            renderedPosts = INIT_POSTS_NUMBER;
                            sortOldestFirst(data);
                            render10items(data);
                            localStorage.setItem("sortMode", "oldestFirst");
                        });

                        // sord by tags event
                        const sortByTagsButton = document.getElementById('sortByTags');
                        sortByTagsButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            renderedPosts = INIT_POSTS_NUMBER;
                            let tagsArr = [];
                            const tagsCheckbox = document.forms[0];
                            for (let tagOption of tagsCheckbox) {
                                if (tagOption.checked) {
                                    tagsArr.push(tagOption.value);
                                }
                            }
                            posts = sortByTags(data, tagsArr);
                            container.innerHTML = '<h3><hr></h3>';
                            render10items(posts);
                        });

                        // reset tags
                        const resetTagsButton = document.getElementById('resetTags');
                        resetTagsButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            renderedPosts = INIT_POSTS_NUMBER;
                            const tagsCheckbox = document.forms[0];
                            for (let tagOption of tagsCheckbox) {
                                if (tagOption.checked) {
                                    tagOption.checked = false;
                                }
                            }
                            container.innerHTML = '<h3><hr></h3>';
                            render10items(data);
                            posts = [];
                        });

                        // search posts
                        const searchButton = document.getElementById('searchPosts');
                        searchButton.addEventListener('input', (e) => {
                            e.preventDefault();
                            renderedPosts = INIT_POSTS_NUMBER;
                            posts = searchPosts(data, e.target.value);
                            container.innerHTML = '<h3><hr></h3>';
                            render10items(posts);
                        });
                        /* searchButton.addEventListener('blur', (e) => {
                            e.preventDefault();
                            e.target.value = '';
                        }); */

                        function render10items(arr) {
                            for (let i = renderedPosts - INIT_POSTS_NUMBER; i < renderedPosts && i < arr.length; i++) {
                                const post = createPostItem(arr[i]);
                                container.appendChild(post);
                            }

                            // add event listeners for newly rendered delete posts buttons
                            const deleteButtons = document.querySelectorAll('.delete');
                            Array.from(deleteButtons).forEach(button => {
                                button.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    const postToDelete = button.parentNode;
                                    deletePost(data, postToDelete.firstChild.innerHTML);
                                    postToDelete.remove();
                                    if(document.querySelectorAll('.post').length < 1) {
                                        render10items(arr);
                                    }
                                });
                            });
                        }

                        window.onscroll = function () {
                            const d = document.documentElement;
                            const offset = d.scrollTop + window.innerHeight;
                            if (offset === d.offsetHeight && renderedPosts <= (MAX_POSTS_NUMBER - 10)) {
                                renderedPosts += 10;
                                if (posts.length > 0) {
                                    render10items(posts);
                                } else render10items(data);
                            }
                            scrollFunction();
                        };

                        const returnTopButton = document.getElementById('returnTop');
                        returnTop.addEventListener('click', (e) => {
                            e.preventDefault();
                            renderedPosts = INIT_POSTS_NUMBER;
                            container.innerHTML = '<h3><hr></h3>';
                            if (posts.length > 0) {
                                    render10items(posts);
                                } else render10items(data);
                            document.body.scrollTop = 0;
                            document.documentElement.scrollTop = 0;
                        });

                    }).catch(function (err) {
                        console.log(err);
                    });
                }


                function copyPostsArray(arr) {
                    let copyPosts = arr.map((post) => {
                        var obj = Object.assign({}, post);
                        return obj;
                    });
                    return copyPosts;
                }

                function sortOldestFirst(arr) {
                    arr.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
                }

                function sortNewestFirst(arr) {
                    arr.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
                }

                function sortByTags(arr, tags) {
                    //add property for sorting (or clean existing)
                    let arrWithAddProp = arr.map((post) => {
                        post.matchedTags = 0;
                        return post;
                    });

                    // counting matches
                    for (let post of arrWithAddProp) {
                        for (let tag of tags) {
                            if ((post.tags.length > 0) && (Object.values(post.tags).indexOf(tag) > -1)) {
                                post.matchedTags += 1;
                            }
                        }
                    }

                    // filter out posts with no matching
                    let filteredByMatch = arrWithAddProp.filter((post) => post.matchedTags > 0);

                    // sorting newest first
                    sortNewestFirst(filteredByMatch);

                    // sorting array
                    filteredByMatch.sort((a, b) => b.matchedTags - a.matchedTags);

                    return filteredByMatch;
                }

                function searchPosts(arr, val) {
                    const res = arr.filter((post) => {
                        return post.title.indexOf(val) > -1;
                    })
                    return res;
                }

                function createPostItem(val) {
                    const item = document.createElement('div');
                    item.setAttribute('class', 'post');
                    const itemHeader = document.createElement('h3');
                    itemHeader.innerHTML = val.title;
                    item.appendChild(itemHeader);
                    const itemDescription = document.createElement('p');
                    itemDescription.innerHTML = val.description;
                    item.appendChild(itemDescription);
                    const itemPic = document.createElement('img');
                    itemPic.setAttribute('src', val.image);
                    item.appendChild(itemPic);
                    const itemDate = document.createElement('p');
                    //for other-style representing of date string use:
                    //let date = new Date(Date.parse(val.createdAt));
                    //itemDate.innerHTML = date.toString();
                    itemDate.innerHTML = val.createdAt;
                    item.appendChild(itemDate);
                    const itemTags = document.createElement('p');
                    for (let i = 0, l = val.tags.length; i < l; i++) {
                        itemTags.innerHTML += "<button><a href='#'>" + val.tags[i] + "</a></button>";
                    }
                    item.appendChild(itemTags);
                    const deleteButton = document.createElement('button');
                    deleteButton.setAttribute('class', 'delete');
                    deleteButton.innerHTML = '<i class="fas fa-window-close"></i>';
                    item.appendChild(deleteButton);
                    return item;
                }

                function deletePost(arr, title) {
                    let indexOfObj;
                    for (let i = 0, l = arr.length; i < l; i++) {
                        if (arr[i].title == title) {
                            indexOfObj = i;
                            break;
                        }
                    }
                    arr.splice(indexOfObj, 1);
                }
                function scrollFunction() {
                    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                        document.getElementById("returnTop").style.display = "block";
                    } else {
                        document.getElementById("returnTop").style.display = "none";
                    }
                }
