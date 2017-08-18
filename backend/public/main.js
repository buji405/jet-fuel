
$(function() {
  getFolders()
  getLinks()
})

let folderId;

$('.submit').on('click', (e) => {
  let folderInput = $('.folder-input').val()
  e.preventDefault()
  console.log(folderInput);
  clearInputs(folderInput)
  $('.folder-list-container').append(addFolder(folderInput))
})

const clearInputs = (folderInput) => {
  $('.input').val('')
}

$('.folder-list-container').on('click', '.short-submit', (e) => {
  console.log('hi');
  e.preventDefault()
  let urlInput = $(e.target).parent().find('.origURL').val()
  let descriptionInput = $(e.target).parent().find('.description').val()


  console.log(urlInput);
  console.log(descriptionInput);
  console.log(folderId);

  addLink(urlInput, descriptionInput, folderId, $(e.target).parent().find('.info-wrapper'))
})

$('.folder-list-container').on('click', '.folder', function (e) {
  console.log('hi');
  $('.drop-down').toggleClass('show')
  folderId =  e.target.value
  getFolderLinks(folderId, $(this).parent().find('.info-wrapper'))
  console.log($(this).parent().find('.info-wrapper'));
})

$('.folder-list-container').on('click', '.delete-folder', function (e) {
  console.log($(e.target).val());
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
  .then((res) => getFolders())
}

const getFolders = () => {
  $('.folder-list-container').html('')
  fetch(`/api/v1/folders`)
  .then((res) => res.json())
  .then((folderName) => {
    folderName.forEach((folderName) => {
      // console.log(folderName);
      $('.folder-list-container').append(`
          <div class="folder-container">
          <button class="folder" value="${folderName.id}">${folderName.folderName}</button>
          <button class="delete-folder" value="${folderName.id}">Delete</button
            <div class="drop-down show">
              <input class="input description" type="text" placeholder="description">
              <input class="input origURL" type="text" placeholder="URL">
              <input class="short-submit" type="submit" value="Shorten URL">
              <div class="info-wrapper"></div>
            </div>
            </div>
        `)
    })
  })
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
    console.log(res);
    getLinks()
    appendInfo(res.origURL, res.description, parentElement, res.shortURL)
  })
}

const getLinks = () => {
  fetch(`/api/v1/links`)
    .then((res) => res.json())
  .then((data) => {
    console.log(data)

  })
}

const deleteFolder = (id) => {
  console.log('hey');
  fetch(`/api/v1/folders/${id}`, {
    method: 'DELETE'
  })
    .then(() => getFolders())
}

const appendInfo = (url, description, parentElement, shortURL) => {
  parentElement.append(`
    <div>
      <div class="descriptionTitle">${description}</div>
      <div class="urlTitle">${url}</div>
      <div class="shortTitle">${window.location.href}${shortURL}</div>
    </div>`)
}

const getFolderLinks =  (id, parentElement) => {
  fetch(`/api/v1/folders/${id}/links`)
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    data.forEach((info) => {
      appendInfo(info.origURL, info.description, parentElement, info.shortURL)
    })
  })
}
