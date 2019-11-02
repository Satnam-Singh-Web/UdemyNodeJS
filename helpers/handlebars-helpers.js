/*jshint esversion:6*/
const moment = require("moment");

module.exports = {
    select: function (selected, options) {
        return options
            .fn(this)
            .replace(new RegExp('value="' + selected + '"'), '$&selected="selected"');
    },
    generateTime: function (date, format) {
        return moment(date).format(format);
    },
    paginate: function (options) {
        let output = "";
        if (options.hash.current === 1) {
            output += `<l1 class='page-item disabled'><a class='page-link'>First Page</a></l1>`;
        } else {
            output += `<l1 class='page-item'><a href='?page=1' class='page-link'>First Page</a></l1>`;
        }
        let i =
            Number(options.hash.current) > 5 ? Number(options.hash.current) - 4 : 1;
        if (i !== 1) {
            output += `<l1 class='page-item disabled'><a class='page-link'>....</a></l1>`;
        }
        for (; i <= Number(options.hash.current) + 4 && i <= options.hash.pages; i++) {
            if (i === options.hash.current) {
                output += `<l1 class='page-item' active><a href='?page=${i}' class='page-link'>${i}</a></l1>`;
            } else {
                output += `<l1 class='page-item'><a href='?page=${i}' class='page-link'>${i}</a></l1>`;
            }
            if (i === Number(options.hash.current) + 4 && i < options.hash.pages) {
                output += `<l1 class='page-item disabled'><a class='page-link'>....</a></l1>`;
            }
        }
        if (options.hash.current === options.hash.pages) {
            output += `<l1 class='page-item disabled'><a class='page-link'>Last Page</a></l1>`;
        } else {
            output += `<l1 class='page-item '><a href="?page=${options.hash.pages}" class='page-link'>Last Page</a></l1>`;
        }
        return output;
        // console.log(options.hash.current);
    }
};