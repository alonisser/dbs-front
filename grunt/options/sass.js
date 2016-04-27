module.exports = {
    dist: {
        options: {
            style: 'compressed',
        },
        /*
         files: {
         'css/bhsclient.css' : 'scss/bhsclient.scss'
         }
         */
        files: [
            {
                src: ['scss/bhsclient.scss'],
                dest: '<%= dist_dir %>' + 'css/',
                expand: true,
                flatten: true,
                ext: '.css'
            },

            {
                src: ['under_construction/scss/uc.scss'],
                dest: '<%= dist_dir %>' + 'under_construction/css/',
                expand: true,
                flatten: true,
                ext: '.css'
            }
        ]
    }
}
