from fabric.api import *
from fabric.colors import *
from fabric.contrib.files import *
from fabric.utils import *


env.hosts = ['instaco.de']
env.remote_path = '/srv/instacode'
env.env = 'prod'
env.user = 'root'


def manage(cmd):
    run('./manage.py %s --settings=config.%s' % (cmd, env.env))


def deploy():
    with cd(env.remote_path):
        print yellow('Updating code')
        run('git reset --hard')
        run('git pull origin master')
        run('git clean -fd')
        run('chown www-data: -R .')

        run('cat deployment/veb.yml | veb -y import')

        if not exists('env'):
            print yellow('Creating virtualenv')
            run('virtualenv env')

        run('npm install')
        run('./node_modules/.bin/bower install --allow-root')
        run('./node_modules/.bin/gulp')

        with prefix('. env/bin/activate'):
            print yellow('Installing deps')
            run('pip install -r requirements.txt')
            print yellow('Collecting static')
            manage('collectstatic --noinput -v1')
            print yellow('Migrating DB')
            manage('migrate')

        print yellow('Installing website config')
        run('veb maintenance instacode off')
        run('veb apply')

    print green('Deployment done')
