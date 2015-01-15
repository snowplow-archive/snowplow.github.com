Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/trusty64"
  config.ssh.forward_agent = true

  # Forward guest port 4000 to host port 4001 (for Jekyll)
  config.vm.network "forwarded_port", guest: 4000, host: 4001

  config.vm.provider :virtualbox do |vb|
    vb.name = Dir.pwd().split("/")[-1] + "-" + Time.now.to_f.to_i.to_s
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    vb.customize [ "guestproperty", "set", :id, "--timesync-threshold", 10000 ]
    # We don't need much memory for Golang
    vb.memory = 4096
  end

  config.vm.provision :shell do |sh|
    sh.path = "vagrant/up.bash"
  end

  # Requires Vagrant 1.7.0+
  config.push.define "binary", strategy: "local-exec" do |push|
    push.script = "vagrant/push.bash"
  end

end