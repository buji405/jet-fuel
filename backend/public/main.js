
$(function() {
  getFolders()
  getLinks()
})

let folderId;

$('.submit').on('click', (e) => {
  let folderInput = $('.folder-input').val()
  e.preventDefault()
  clearInputs(folderInput)
  $('.folder-list-container').append(addFolder(folderInput))
})

const clearInputs = (folderInput) => {
  $('.input').val('')
}

$('.folder-list-container').on('click', '.short-submit', (e) => {
  e.preventDefault()
  let urlInput = $(e.target).parent().find('.origURL').val()
  let descriptionInput = $(e.target).parent().find('.description').val()
  $('.input').val('')

  addLink(urlInput, descriptionInput, folderId, $(e.target).parent().find('.info-wrapper'))
})

$('.folder-list-container').on('click', '.folder', function (e) {
  $(e.target).parent().find(".drop-down").toggleClass("show")
  folderId =  e.target.value
  $('.info-wrapper').empty()
  getFolderLinks(folderId, $(this).parent().find('.info-wrapper'), $('#sorting').val())
})

$('.folder-list-container').on('click', '.delete-folder', function (e) {
    deleteFolder($(e.target).val())
})

const addFolder = (folderInput) => {
  fetch(`/api/v1/folders`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      'folderName': folderInput
    })
  })
  .then((res) => res.json())
  .then((res) => console.log(res))
  .then((res) => getFolders())
  .catch((error ) => console.log(error))
}

const getFolders = () => {
  $('.folder-list-container').html('')
  fetch(`/api/v1/folders`)
  .then((res) => res.json())
  .then((folderName) => {
    folderName.forEach((folderName) => {
      $('.folder-list-container').append(`
          <div class="folder-container">
            <button class="folder" value="${folderName.id}">${folderName.folderName}</button>
              <div class="drop-down">
                <input class="input description" type="text" placeholder="description">
                <input class="input origURL" type="text" placeholder="URL">
                <input class="short-submit" type="submit" value="Shorten URL">
                <div class="info-wrapper"></div>
                <button class="delete-folder" value="${folderName.id}">Delete Folder</button>
              </div>
            </div>
        `)
    })
  })
  .catch(error => console.log(error))
}

const addLink = (urlInput, descriptionInput, folderId, parentElement) => {
  fetch(`/api/v1/links`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      'origURL': urlInput,
       'description': descriptionInput,
       'folder_id': folderId
    })
  })
  .then((res) => res.json())
  .then((res) => {
    console.log('hiii');
    // getLinks()
    appendInfo(res.origURL, res.description, parentElement, res.shortURL, res.id, res.created_at)
    console.log('add link', res.created_at);
  })
  .catch(error => console.log(error))
}

const getLinks = () => {
  fetch(`/api/v1/links`)
  .then((res) => res.json())
  .then((link) => {
    console.log(link)
  })
  .catch(error => console.log(error))
}

const deleteFolder = (id) => {
  fetch(`/api/v1/folders/${id}`, {
    method: 'DELETE'
  })
    .then(() => getFolders())
    .catch(error => console.log(error))
}

const appendInfo = (url, description, parentElement, shortURL, id, created) => {
  // $('.new-info').html("")
  console.log(shortURL);
  console.log('id', id);

  parentElement.append(`
    <div class="new-info">
      <div class="descriptionTitle">${description}</div>
       <a class="shortTitle" href="/api/v1/links/${id}" target="_blank">jf.com/${shortURL}</a>
       <p class="date">Added: ${moment(created).format('M/DD/YY h:mm')}</p>
    </div>`)
}

const getFolderLinks =  (id, parentElement, sortOrder) => {
  fetch(`/api/v1/folders/${id}/links`)
  .then((res) => res.json())
  .then((data) => {
    console.log(data);

    if(sortOrder === 'asc') {
      data.forEach((info) => {
        appendInfo(info.origURL, info.description, parentElement, info.shortURL, info.id, info.created_at)
      })
    } else if (sortOrder === 'dec') {
      data.reverse()
      data.forEach((info) => {
        appendInfo(info.origURL, info.description, parentElement, info.shortURL, info.id, info.created_at)
      })
    }

  })
  .catch(error => console.log(error))
}
